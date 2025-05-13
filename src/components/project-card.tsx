"use client"

interface ProjectItem {
  name: string;
  url: string;
  description?: string;
  ogDescription?: string;
  handle?: string;
  github?: string;
  handleUrl?: string;
  iconUrl?: string;
}

interface ProjectCardProps {
  item: ProjectItem;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item }) => {
  let displayDescription = item.description;
  if (!displayDescription && item.ogDescription) {
    const firstSentenceEnd = item.ogDescription.indexOf('.');
    if (firstSentenceEnd !== -1) {
      displayDescription = item.ogDescription.substring(0, firstSentenceEnd + 1);
    } else {
      displayDescription = item.ogDescription;
    }
  }

  return (
    <div key={item.url} className="flex items-center">
      {item.iconUrl ? (
        <img
          src={item.iconUrl}
          className="w-4 h-4 mr-3 mt-1 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            console.warn(`Failed to load icon: ${item.iconUrl} for ${item.name}`);
          }}
        />
      ) : (
        <div className="w-4 h-4 mr-3 mt-1 rounded-full flex-shrink-0"></div>
      )}
      <div className="flex-grow flex items-baseline gap-2">
        <span className="flex-shrink min-w-0 max-w-[600px] overflow-hidden whitespace-nowrap text-ellipsis">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold decoration-gray-400 no-underline underline-offset-4 hover:underline">{item.name}</a>
          {displayDescription && <span className="inline text-gray-600 dark:text-gray-400"> - {displayDescription}</span>}
        </span>

        {item.handle &&
          (item.handleUrl ?
            <a href={item.handleUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline"> ({item.handle})</a> :
            <span className="text-sm"> ({item.handle})</span>
          )
        }
        {item.github && (
          <a href={item.github} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
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
      </div>
    </div >
  );
};

export default ProjectCard; 