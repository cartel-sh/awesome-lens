import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import type { Root, Content } from 'mdast';
import Header from './components/header';

async function getMarkdownContent() {
  const fullPath = path.join(process.cwd(), 'README.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  function removeH1() {
    return (tree: Root) => {
      if (!tree.children) return;
      tree.children = tree.children.filter(
        (node: Content) => !(node.type === 'heading' && node.depth === 1)
      );
    };
  }

  const processedContent = await remark()
    .use(removeH1)
    .use(html)
    .process(fileContents);
  const contentHtml = processedContent.toString();
  return contentHtml;
}

export default async function Home() {
  const contentHtml = await getMarkdownContent();

  return (
    <div className="flex flex-col items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="prose prose-neutral dark:!prose-invert lg:prose-xl prose-p:my-2 max-w-4xl p-4 sm:p-8 sm:pt-0 w-full">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </main>
      <footer className="py-8 text-center text-sm text-gray-500 w-full">
        <p>
          Built with love by the Lens community
        </p>
      </footer>
    </div>
  );
}
