import fs from 'fs';
import path from 'path';
// node-fetch, AbortController, and cheerio are no longer needed
import ogs from 'open-graph-scraper';

interface ProjectItem {
  name: string;
  url: string;
  description?: string;
  handle?: string;
  github?: string;
  handleUrl?: string;
  iconUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
}

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
        return metadata; // Success
      } else {
        // OGS call succeeded but returned success: false
        lastError = new Error(result.error || 'Unknown error from open-graph-scraper');
        // Continue to retry logic below
      }
    } catch (error: any) {
      // OGS call itself threw an error (e.g., network, timeout)
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable = errorMessage.includes('getaddrinfo ENOTFOUND') ||
        errorMessage.includes('EAI_AGAIN') ||
        errorMessage.includes('timeout') ||
        (error.name === 'AbortError') ||
        (typeof error.type === 'string' && error.type === 'aborted');

      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        // Log final error and exit function
        let reason = 'Unknown error';
        if (lastError instanceof Error) reason = lastError.message;
        else if (typeof lastError === 'string') reason = lastError;

        const failureMessage = `Failed to fetch metadata for ${projectUrl} after ${attempt + 1} attempt(s): ${reason}`;
        console.warn(failureMessage);
        return {}; // Give up
      }
      // Otherwise, it's a retryable error, continue to delay/retry logic
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

  // Should only reach here if all retries explicitly failed and loop completed
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
        process.stdout.write(`Fetching metadata for ${item.name} (${item.url})... `);

        const metadata = await fetchProjectMetadata(item.url);
        processedItems.push({ ...item, ...metadata, category });

        const foundMeta = metadata.iconUrl || metadata.ogImage;
        if (foundMeta) {
          process.stdout.write(`found: ${foundMeta}\n`);
        } else {
          process.stdout.write("not found.\n");
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

  fs.writeFileSync(outputFilePath, JSON.stringify(projectsWithMeta, null, 2));
  console.log(`Successfully generated ${outputFilePath}`);
}

generateProjectMeta().catch(error => {
  console.error("Failed to generate project metadata:", error);
  process.exit(1);
}); 