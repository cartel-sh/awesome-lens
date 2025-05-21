"use client";

import fs from 'fs';
import path from 'path';
import { useState, useEffect } from 'react';
import Header from '../components/header';
import projectsMetaData from '../../projects-meta.json';
import ProjectCard from '../components/project-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectItem {
  name: string;
  url: string;
  description?: string;
  handle?: string;
  github?: string;
  handleUrl?: string;
  iconUrl?: string;
}

interface Projects {
  [category: string]: ProjectItem[];
}

const projects: Projects = projectsMetaData;

type SortOrder = "alphabetical" | "openSourceFirst";

const sortProjects = (items: ProjectItem[], order: SortOrder): ProjectItem[] => {
  if (order === "openSourceFirst") {
    return [...items].sort((a, b) => {
      const aHasGithub = !!a.github;
      const bHasGithub = !!b.github;
      if (aHasGithub && !bHasGithub) return -1;
      if (!aHasGithub && bHasGithub) return 1;
      return a.name.localeCompare(b.name);
    });
  }
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
};

export default function Home() {
  const [sortOrder, setSortOrder] = useState<SortOrder>("openSourceFirst");
  const [clientProjects, setClientProjects] = useState<Projects>(projects);

  return (
    <div className="flex flex-col items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="max-w-4xl p-4 sm:p-8 sm:pt-0 w-full">
        <div className="my-4 flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Sort methond:</p>
          <Select value={sortOrder} onValueChange={(value: string) => setSortOrder(value as SortOrder)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="openSourceFirst">Open source first</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {Object.entries(clientProjects).map(([category, items]) => {
          const sortedItems = sortProjects(items, sortOrder);

          if (sortedItems.length === 0) {
            return null;
          }

          return (
            <div key={category}>
              <h2 className='font-bold text-2xl my-4'>{category}</h2>
              <div className="flex flex-col gap-2 sm:pl-4">
                {sortedItems.map((item) => (
                  <ProjectCard key={item.url} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </main>
      <footer className="py-8 text-center text-sm text-gray-500 w-full">
        <p>
          Built with love by the Lens community. <a href="https://github.com/kuhaku-xyz/awesome-lens" target="_blank" rel="noopener noreferrer" className="underline">Contribute.</a>
        </p>
      </footer>
    </div>
  );
}
