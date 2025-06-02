"use client"

import { useState } from "react";
import { Badge } from "./ui/badge";

interface ProjectItem {
  name: string;
  url?: string;
  description?: string;
  ogDescription?: string;
  ogTitle?: string;
  ogImage?: string;
  handle?: string;
  github?: string;
  handleUrl?: string;
  iconUrl?: string;
  twitter?: string;
  tags?: string[];
}

interface ProjectCardProps {
  item: ProjectItem;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  let displayDescription = item.description;
  if (!isExpanded && !displayDescription && item.ogDescription) {
    const firstSentenceEnd = item.ogDescription.indexOf('.');
    if (firstSentenceEnd !== -1) {
      displayDescription = item.ogDescription.substring(0, firstSentenceEnd + 1);
    } else {
      displayDescription = item.ogDescription;
    }
  } else if (isExpanded) {
    displayDescription = item.description || item.ogDescription;
  }

  return (
    <div key={item.url} className="flex rounded-md flex-col cursor-pointer dark:border-gray-700 p-2 hover:bg-muted/30 transition-colors duration-150" onClick={(e) => {
      if (e.target instanceof HTMLAnchorElement) {
        return;
      }
      setIsExpanded(!isExpanded)
    }}>
      <div className="flex items-center w-full">
        <div className={`w-4 h-4 mr-3 mt-1 flex-shrink-0 flex items-center rounded-full justify-center`}>
          {item.iconUrl ? (
            <img
              src={item.iconUrl}
              className="w-4 h-4 z-10 rounded-sm object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                console.warn(`Failed to load icon: ${item.iconUrl} for ${item.name}`);
              }}
            />
          ) : null}
        </div>
        <div className="flex-grow flex gap-2 items-baseline">
          <span className="flex-shrink min-w-0 max-w-[600px] overflow-hidden whitespace-nowrap text-ellipsis">
            <a href={item.url || item.github} target="_blank" rel="noopener noreferrer" className="font-semibold decoration-gray-400 no-underline underline-offset-4 hover:underline" onClick={(e) => e.stopPropagation()}>{item.name}</a>
            {displayDescription && !isExpanded && <span className="inline text-gray-600 dark:text-gray-400"> - {displayDescription}</span>}
          </span>

          {item.github && !isExpanded && (
            <a href={item.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" onClick={(e) => e.stopPropagation()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="inline-block"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
          )}
          {item.tags && item.tags.length > 0 && !isExpanded && (
            <Badge variant="secondary">
              {item.tags.map(tag => `${tag}`).join(' ')}
            </Badge>
          )}
        </div>
      </div>
      {isExpanded && (
        <div
          className="mt-4 p-4 pt-2 border-t border-dashed max-w-[450px] border border-border rounded-md dark:border-gray-600 cursor-pointer hover:bg-muted/50 transition-colors duration-150"
          onClick={(e) => {
            e.stopPropagation();
            window.open(item.url || item.github, '_blank');
          }}
        >
          {item.ogTitle && <h3 className="text-lg font-semibold mb-2">{item.ogTitle}</h3>}
          {item.ogImage && <img src={item.ogImage} alt={item.ogTitle || item.name} className="rounded-md mb-3 max-h-60 object-contain" />}
          {displayDescription && <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{displayDescription}</p>}

          {item.tags && item.tags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(item.handle || item.github || item.twitter) && (
            <div className="mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
              <h4 className="text-md font-semibold mb-2">Socials</h4>
              <div className="flex flex-col space-y-1">
                {item.handle && (
                  <a href={`https://hey.xyz/u/${item.handle}`} target="_blank" rel="noopener noreferrer" className=" gap-2 text-sm text-muted-foreground hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_4671_4573)">
                        <path d="M12.9746 5.21719C12.2218 5.21719 11.5463 5.53677 11.0315 6.05249L10.9786 6.02384C10.8606 4.3334 9.59105 3 8 3C6.40895 3 5.13937 4.3334 5.02136 6.02384L4.96846 6.05249C4.45371 5.53677 3.77823 5.21719 3.02543 5.21719C1.35504 5.21719 0 6.68503 0 8.49669C0 10.0615 1.43438 11.4037 1.79044 11.7123C3.4649 13.1559 5.64598 14 8 14C10.354 14 12.5351 13.1559 14.2096 11.7123C14.5676 11.4037 16 10.0637 16 8.49669C16 6.68503 14.645 5.21719 12.9725 5.21719H12.9746Z" fill="currentColor" />
                      </g>
                      <defs>
                        <clipPath id="clip0_4671_4573">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    @{item.handle}
                  </a>
                )}
                {item.twitter && (
                  <a href={`https://x.com/${item.twitter}`} target="_blank" rel="noopener noreferrer" className=" gap-2 text-sm text-muted-foreground hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
                    <div className="w-4 h-4 mt-1 rounded-full flex-shrink-0 text-muted-foreground">
                      <svg width="300" height="271" viewBox="0 0 300 271" style={{
                        width: '100%',
                        height: '100%',
                      }}

                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z" />
                      </svg>

                    </div>

                    @{item.twitter}
                  </a>
                )}
                {item.github && (
                  <a href={item.github} target="_blank" rel="noopener noreferrer" className=" gap-1 text-sm text-muted-foreground hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="inline-block mr-1.5" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    {item.github.split('/')[3]}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div >
  );
};

export default ProjectCard; 