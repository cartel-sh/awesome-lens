"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="w-full flex justify-between items-center p-4 sm:px-8 mb-4 border-b border-foreground/30">
      <div className="flex items-center gap-2 sm:gap-4">
        <Image src="/awesomelens.png" alt="Awesome Lens Logo" width={32} height={32} />
        <h1 className="text-2xl font-bold">Awesome Lens</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button
          asChild
          variant="outline"
          onClick={() => window.open("https://github.com/kuhaku-xyz/awesome-lens", "_blank")}
        >
          <a
            href="https://github.com/kuhaku-xyz/awesome-lens"
            target="_blank"
            rel="noopener noreferrer"
          >
            Update List
          </a>
        </Button>
      </div>
    </header>
  );
} 