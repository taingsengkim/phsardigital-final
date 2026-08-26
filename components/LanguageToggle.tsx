"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch Language / ផ្លាស់ប្តូរភាសា"
          title={language === "km" ? "Switch to English" : "ប្តូរទៅ ភាសាខ្មែរ"}
          className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 shadow-xs transition hover:scale-108 hover:border-primary/25 hover:bg-primary/15 dark:border-white/10 dark:bg-white/[0.07] cursor-pointer overflow-hidden p-1.5"
        >
          {language === "km" ? (
            <Image
              src="/Flag_of_Cambodia.svg"
              alt="Cambodia flag"
              width={22}
              height={15}
              className="h-full w-full object-cover rounded-xs"
            />
          ) : (
            <Image
              src="/Flag_of_the_United_Kingdom.svg"
              alt="UK flag"
              width={22}
              height={15}
              className="h-full w-full object-cover rounded-xs"
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] p-1.5 shadow-xl">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold cursor-pointer text-gray-800 dark:text-zinc-200 hover:bg-[#6C4CD8]/10 hover:text-[#6C4CD8]"
        >
          <div className="flex items-center gap-2.5">
            <Image
              src="/Flag_of_the_United_Kingdom.svg"
              alt="UK flag"
              width={20}
              height={14}
              className="h-3.5 w-5 object-cover rounded-xs"
            />
            <span>UK</span>
          </div>
          {language === "en" && <Check size={14} className="text-[#6C4CD8]" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setLanguage("km")}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold cursor-pointer text-gray-800 dark:text-zinc-200 hover:bg-[#6C4CD8]/10 hover:text-[#6C4CD8]"
        >
          <div className="flex items-center gap-2.5">
            <Image
              src="/Flag_of_Cambodia.svg"
              alt="Cambodia flag"
              width={20}
              height={14}
              className="h-3.5 w-5 object-cover rounded-xs"
            />
            <span>Cambodia</span>
          </div>
          {language === "km" && <Check size={14} className="text-[#6C4CD8]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
