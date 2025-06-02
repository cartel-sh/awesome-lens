import fs from 'fs';
import path from 'path';
import projectsDataJson from '../../projects.json';
import projectsMetaJson from '../../projects-meta.json';
import { ProjectItem } from './types';

interface Projects {
  [category: string]: ProjectItem[];
}

const projectsData: Projects = projectsDataJson as Projects;
const projectsMetaDataRaw = projectsMetaJson as any;
const projectsMetaData: Projects = Object.fromEntries(
  Object.entries(projectsMetaDataRaw).filter(([key]) => key !== '_metadata')
) as Projects;
const metadata = projectsMetaDataRaw._metadata;
const readmePath = path.join(process.cwd(), 'README.md');

let markdownContent = '# Awesome Lens \n\n';
markdownContent += 'Hosted version is available at [awesome.lens.box](https://awesome.lens.box).\n';
markdownContent += 'This readme is generated from [projects.json](https://github.com/kuhaku-xyz/awesome-lens/blob/main/projects.json), \
to contribute, please [open a pr on github](https://github.com/kuhaku-xyz/awesome-lens/edit/main/projects.json)\n\n';

for (const [category, items] of Object.entries(projectsMetaData)) {
  markdownContent += `## ${category} (${items.length})\n\n`;
  items.forEach((item: ProjectItem) => {
    markdownContent += `- [${item.name}](${item.url || item.github})`;
    if (item.description) {
      markdownContent += ` - ${item.description}`;
    } else if (item.ogDescription) {
      markdownContent += ` - ${item.ogDescription}`;
    }
    if (item.handle) {
      const profileBaseUrl = 'https://hey.xyz/u/';
      const handleUrl = item.handleUrl || `${profileBaseUrl}${item.handle.startsWith('@') ? item.handle.substring(1) : item.handle}`;
      markdownContent += ` ([${item.handle}](${handleUrl}))`;
    }
    if (item.github) {
      markdownContent += ` ([github](${item.github}))`;
    }
    markdownContent += '\n';
  });
  markdownContent += '\n';
}

// Add last updated information if available
if (metadata?.lastUpdated) {
  const lastUpdatedDate = new Date(metadata.lastUpdated);
  markdownContent += `---\n\n*Last updated: ${lastUpdatedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })}*\n`;
}

fs.writeFileSync(readmePath, markdownContent.trim() + '\n');

console.log('README.md generated successfully from projects.json'); 