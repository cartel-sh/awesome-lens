"use client";

import fs from 'fs';
import path from 'path';
import { useState, useEffect } from 'react';
import Header from '../components/header';
import projectsMetaDataRaw from '../../projects-meta.json';
import ProjectCard from '../components/project-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectItem } from '@/lib/types';


interface Projects {
  [category: string]: ProjectItem[];
}

// Type for the raw data with metadata
const projectsDataRaw = projectsMetaDataRaw as any;
const metadata = projectsDataRaw._metadata;

// Extract projects excluding metadata
const projects: Projects = Object.fromEntries(
  Object.entries(projectsDataRaw).filter(([key]) => key !== '_metadata')
) as Projects;

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
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Initialize all categories as expanded
    const initialState: Record<string, boolean> = {};
    Object.keys(projects).forEach(category => {
      initialState[category] = true;
    });
    return initialState;
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

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

          const isExpanded = expandedCategories[category];

          return (
            <div key={category}>
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-md p-2 -ml-2 transition-colors duration-150"
                onClick={() => toggleCategory(category)}
              >
                <h2 className='font-bold text-2xl my-4'>{category} ({sortedItems.length})</h2>
                <svg
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {isExpanded && (
                <div className="flex flex-col gap-2 sm:pl-4">
                  {sortedItems.map((item) => (
                    <ProjectCard key={`${category}-${item.name}-${item.url}`} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </main>
      <footer className="py-8 text-center text-sm text-gray-500 w-full">
        <p>
          Built with love by the Lens community. <a href="https://github.com/kuhaku-xyz/awesome-lens" target="_blank" rel="noopener noreferrer" className="underline">Contribute.</a>
        </p>
        {metadata?.lastUpdated && (
          <p className="mt-2 text-xs text-gray-400">
            Last updated: {new Date(metadata.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </footer>
    </div>
  );
}
