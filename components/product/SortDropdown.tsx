"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import type { ListingsQuery } from "@/lib/types";

type SortOption = NonNullable<ListingsQuery["sort"]>;

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  top_rated: "Top Rated",
};

type Props = {
  value: SortOption;
  onChange: (sort: SortOption) => void;
};

export default function SortDropdown({ value, onChange }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-sm font-medium">
          Sort by
          <ChevronsUpDownIcon size={13} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className={option === value ? "font-semibold" : ""}
          >
            {SORT_LABELS[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
