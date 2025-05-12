import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

async function getMarkdownContent() {
  const fullPath = path.join(process.cwd(), 'README.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const processedContent = await remark()
    .use(html)
    .process(fileContents);
  const contentHtml = processedContent.toString();
  return contentHtml;
}

export default async function Home() {
  const contentHtml = await getMarkdownContent();

  return (
    <div className="flex flex-col items-center min-h-screen p-8 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      <main className="prose dark:prose-invert lg:prose-xl max-w-4xl w-full py-8">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </main>
      <footer className="py-8 text-center text-sm text-gray-500 w-full">
        <p>
          Built with love
        </p>
      </footer>
    </div>
  );
}
