import fs from 'fs';
import path from 'path';
import Header from './components/header';
import projectsMetaData from '../../projects-meta.json';
import ProjectCard from './components/project-card';

interface Projects {
  [category: string]: any[];
}

const projects: Projects = projectsMetaData;

export default async function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="prose prose-neutral dark:!prose-invert lg:prose-lg prose-p:my-2 max-w-4xl p-4 sm:p-8 sm:pt-0 w-full">
        <p>All Lens Chain / Lens Protocol projects in one place</p>
        {Object.entries(projects).map(([category, items]) => (
          <div key={category}>
            <h2>{category}</h2>
            <div className="flex flex-col gap-2 sm:pl-4">
              {items.map((item) => (
                <ProjectCard key={item.url} item={item} />
              ))}
            </div>
          </div>
        ))}
      </main>
      <footer className="py-8 text-center text-sm text-gray-500 w-full">
        <p>
          Built with love by the Lens community. <a href="https://github.com/kuhaku-xyz/awesome-lens" target="_blank" rel="noopener noreferrer" className="underline">Contribute.</a>
        </p>
      </footer>
    </div>
  );
}
