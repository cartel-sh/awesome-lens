import fs from 'fs';
import path from 'path';
import ogs from 'open-graph-scraper';
import { ProjectItem } from './types';

interface Projects {
  [category: string]: ProjectItem[];
}

interface ProcessedItem extends ProjectItem {
  category: string;
}

const projectsFilePath = path.join(process.cwd(), 'projects.json');
const outputFilePath = path.join(process.cwd(), 'projects-meta.json');

async function fetchProjectMetadata(projectUrl: string): Promise<Partial<ProjectItem>> {
  const MAX_RETRIES = 3;
  const FETCH_TIMEOUT = 2500; // milliseconds
  let lastError: any = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const urlToFetch = projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`;
      const options = { url: urlToFetch, timeout: FETCH_TIMEOUT };
      const { result } = await ogs(options);

      if (result.success) {
        const metadata: Partial<ProjectItem> = {};
        if (result.ogTitle) metadata.ogTitle = result.ogTitle;
        if (result.ogDescription) metadata.ogDescription = result.ogDescription;

        if (result.ogImage && Array.isArray(result.ogImage) && result.ogImage.length > 0 && result.ogImage[0] && typeof result.ogImage[0].url === 'string') {
          metadata.ogImage = result.ogImage[0].url;
        }

        if (result.favicon && typeof result.favicon === 'string') {
          let faviconValue = result.favicon;
          let resolvedFaviconUrl: string | undefined = undefined;
          if (faviconValue.startsWith('//')) {
            const parsedBaseUrl = new URL(urlToFetch);
            resolvedFaviconUrl = `${parsedBaseUrl.protocol}${faviconValue}`;
          } else if (faviconValue.startsWith('/')) {
            const parsedBaseUrl = new URL(urlToFetch);
            resolvedFaviconUrl = `${parsedBaseUrl.protocol}//${parsedBaseUrl.host}${faviconValue}`;
          } else if (!faviconValue.startsWith('http') && !faviconValue.startsWith('data:')) {
            try {
              resolvedFaviconUrl = new URL(faviconValue, urlToFetch).href;
            } catch (e) {
              console.warn(`Could not resolve relative favicon URL: ${faviconValue} for base: ${urlToFetch}`);
            }
          } else {
            resolvedFaviconUrl = faviconValue;
          }
          if (resolvedFaviconUrl) {
            metadata.iconUrl = resolvedFaviconUrl;
          }
        }

        // Fallback to /favicon.ico if no iconUrl was found from page metadata
        if (!metadata.iconUrl) {
          try {
            // urlToFetch is the original URL passed to ogs, new URL('/favicon.ico', urlToFetch)
            // correctly resolves to scheme://host/favicon.ico
            const fallbackIconUrl = new URL('/favicon.ico', urlToFetch).href;
            metadata.iconUrl = fallbackIconUrl;
          } catch (e) {
            // This catch is for safety, e.g. if urlToFetch was malformed.
            console.warn(`Could not construct fallback /favicon.ico URL for base: ${urlToFetch} due to: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
        return metadata; // Success
      } else {
        lastError = new Error(result.error || 'Unknown error from open-graph-scraper');
      }
    } catch (error: any) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable = errorMessage.includes('getaddrinfo ENOTFOUND') ||
        errorMessage.includes('EAI_AGAIN') ||
        errorMessage.includes('timeout') ||
        (error.name === 'AbortError') ||
        (typeof error.type === 'string' && error.type === 'aborted');

      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        let reason = 'Unknown error';
        if (lastError instanceof Error) reason = lastError.message;
        else if (typeof lastError === 'string') reason = lastError;

        const failureMessage = `Failed to fetch metadata for ${projectUrl} after ${attempt + 1} attempt(s): ${reason}`;
        console.warn(failureMessage);
        return {}; // Give up
      }
    }

    // If we reach here, a retry is needed (either OGS error or explicit catch)
    if (attempt < MAX_RETRIES - 1) {
      const delay = Math.pow(2, attempt) * 200; // Exponential backoff
      process.stdout.write(` (failed, retrying in ${delay}ms) `);
      await new Promise(resolve => setTimeout(resolve, delay));
    } else {
      // This case handles when the loop finishes (last attempt failed)
      let reason = 'Unknown error';
      if (lastError instanceof Error) reason = lastError.message;
      else if (typeof lastError === 'string') reason = lastError;
      console.warn(`Failed to fetch metadata for ${projectUrl} after ${MAX_RETRIES} attempts. Last error: ${reason}`);
    }
  }

  return {};
}


async function generateProjectMeta() {
  console.log('Reading projects.json...');
  const projectsDataString = fs.readFileSync(projectsFilePath, 'utf-8');
  const projectsData: Projects = JSON.parse(projectsDataString);
  const processedItems: ProcessedItem[] = [];

  console.log('Fetching OpenGraph/favicon data for each project (this may take a while)...');
  const allPromises: Promise<void>[] = [];

  for (const category in projectsData) {
    for (const item of projectsData[category]) {
      const promise = (async () => {
        process.stdout.write(`Fetching metadata for ${item.name} (${item.url || item.github})... \n`);

        const originalItemIconUrl = item.iconUrl;

        const fetchedMetadata = await fetchProjectMetadata(item.url || item.github!);

        const mergedItem = { ...item, ...fetchedMetadata, category };

        if (originalItemIconUrl) {
          mergedItem.iconUrl = originalItemIconUrl;
        }

        processedItems.push(mergedItem);

        const foundMetaForLog = mergedItem.iconUrl || mergedItem.ogImage;
        if (foundMetaForLog) {
          process.stdout.write(`metadata processed. Final icon: ${mergedItem.iconUrl || 'none'}, OG Image: ${mergedItem.ogImage || 'none'}\n`);
        } else {
          process.stdout.write("no icon or OG image found.\n");
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      })();
      allPromises.push(promise);
    }
  }

  await Promise.all(allPromises);

  const projectsWithMeta: Projects = {};
  const categoryOrder = Object.keys(projectsData);

  categoryOrder.forEach(category => {
    projectsWithMeta[category] = processedItems
      .filter(item => item.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  // Add metadata with timestamp
  const output = {
    ...projectsWithMeta,
    _metadata: {
      lastUpdated: new Date().toISOString(),
      generatedAt: Date.now()
    }
  };

  fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
  console.log(`Successfully generated ${outputFilePath}`);
}

generateProjectMeta().catch(error => {
  console.error("Failed to generate project metadata:", error);
  process.exit(1);
}); 