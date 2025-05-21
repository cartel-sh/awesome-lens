import fs from 'fs';
import path from 'path';
import projectsDataJson from '../../projects.json';
import projectsMetaJson from '../../projects-meta.json';

interface ProjectItem {
  name: string;
  url: string;
  description?: string;
  handle?: string;
  github?: string;
  handleUrl?: string;
  iconUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface Projects {
  [category: string]: ProjectItem[];
}

const projectsData: Projects = projectsDataJson as Projects;
const projectsMetaData: Projects = projectsMetaJson as Projects;
const readmePath = path.join(process.cwd(), 'README.md');

let markdownContent = '# Awesome Lens \n\n';
markdownContent += 'Hosted version is available at [awesome.lens.box](https://awesome.lens.box).';
markdownContent += 'This readme is generated from [projects.json](https://github.com/kuhaku-xyz/awesome-lens/blob/main/projects.json), to contribute, please edit the json file and open a PR on [github](https://github.com/kuhaku-xyz/awesome-lens)\n\n';

for (const [category, items] of Object.entries(projectsMetaData)) {
  markdownContent += `## ${category}\n\n`;
  items.forEach((item: ProjectItem) => {
    markdownContent += `- [${item.name}](${item.url})`;
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

fs.writeFileSync(readmePath, markdownContent.trim() + '\n');

console.log('README.md generated successfully from projects.json'); 