"use client";

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center p-4 sm:px-8 mb-4 border-b border-foreground/30">
      <h1 className="text-2xl font-bold">Awesome Lens</h1>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/kuhaku-xyz/awesome-lens"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-background text-foreground rounded-lg hover:border-foreground/40 transition-colors border border-foreground/20"
        >
          Update List
        </a>
      </div>
    </header>
  );
} 