"use client"

interface ProjectItem {
  name: string;
  url: string;
  description?: string;
  handle?: string;
  github?: string;
  handleUrl?: string;
  iconUrl?: string;
}

interface ProjectCardProps {
  item: ProjectItem;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item }) => {
  return (
    <div key={item.url} className="flex items-center py-1">
      {item.iconUrl ? (
        <img
          src={item.iconUrl}
          className="not-prose w-4 h-4 mr-3 mt-1 rounded-md object-fit border border-gray-200 dark:border-gray-700 flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            console.warn(`Failed to load icon: ${item.iconUrl} for ${item.name}`);
          }}
        />
      ) : (
        <div className="w-4 h-4 mr-3 mt-1 rounded-md border border-gray-200 dark:border-gray-700 flex-shrink-0"></div>
      )}
      <div className="flex-grow flex-row gap-2">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold decoration-gray-400 no-underline underline-offset-4 hover:underline">{item.name}</a>
        {item.description && <p className="inline-block ml-1 text-gray-600 dark:text-gray-400"> - {item.description}</p>}
        {item.handle &&
          (item.handleUrl ?
            <a href={item.handleUrl} target="_blank" rel="noopener noreferrer" className="text-sm ml-1 hover:underline">({item.handle})</a> :
            <p className="inline-block ml-1"> ({item.handle})</p>
          )
        }
        {item.github &&
          <p className="inline-block ml-1"> (<a href={item.github} target="_blank" rel="noopener noreferrer" className="hover:underline">github</a>)</p>
        }
      </div>
    </div>
  );
};

export default ProjectCard; 