"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch Language"
          title="Switch Language / ផ្លាស់ប្តូរភាសា"
          className="flex h-9 items-center gap-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-[#F4F4F6] dark:bg-[#18181B] px-2.5 py-1 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:border-[#6C4CD8] transition cursor-pointer shadow-xs"
        >
          <Globe size={14} className="text-[#6C4CD8] dark:text-purple-400" />
          <span>{language === "km" ? "🇰🇭 ខ្មែរ" : "🇬🇧 EN"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] p-1.5 shadow-xl">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer text-gray-800 dark:text-zinc-200 hover:bg-[#6C4CD8]/10 hover:text-[#6C4CD8]"
        >
          <div className="flex items-center gap-2">
            <span>🇬🇧</span>
            <span>English</span>
          </div>
          {language === "en" && <Check size={14} className="text-[#6C4CD8]" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setLanguage("km")}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer text-gray-800 dark:text-zinc-200 hover:bg-[#6C4CD8]/10 hover:text-[#6C4CD8]"
        >
          <div className="flex items-center gap-2">
            <span>🇰🇭</span>
            <span>ភាសាខ្មែរ</span>
          </div>
          {language === "km" && <Check size={14} className="text-[#6C4CD8]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
