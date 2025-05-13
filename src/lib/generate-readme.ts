import fs from 'fs';
import path from 'path';
// Use TypeScript dynamic import for JSON
import projectsDataJson from '../../projects.json';

// Define types for the project data
interface ProjectItem {
  name: string;
  url: string;
  description?: string;
  handle?: string;
  github?: string;
  handleUrl?: string;
}

interface Projects {
  [category: string]: ProjectItem[];
}

const projectsData: Projects = projectsDataJson as Projects;
const readmePath = path.join(process.cwd(), 'README.md');

let markdownContent = '# Awesome Lens \n\n';
markdownContent += 'All Lens Chain / Lens Protocol v3 related projects in one place\n\n';

for (const [category, items] of Object.entries(projectsData)) {
  markdownContent += `## ${category}\n\n`;
  items.forEach((item: ProjectItem) => {
    markdownContent += `- [${item.name}](${item.url})`;
    if (item.description) {
      markdownContent += ` - ${item.description}`;
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