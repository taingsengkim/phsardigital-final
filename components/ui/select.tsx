"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" className={cn("flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:disabled:bg-slate-800 [&>span]:truncate", className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDownIcon className="size-4 text-slate-400" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>
}

function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content data-slot="select-content" position={position} className={cn("z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100", position === "popper" && "w-[var(--radix-select-trigger-width)]", className)} {...props}><SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center"><ChevronUpIcon className="size-4" /></SelectPrimitive.ScrollUpButton><SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport><SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center"><ChevronDownIcon className="size-4" /></SelectPrimitive.ScrollDownButton></SelectPrimitive.Content></SelectPrimitive.Portal>
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item data-slot="select-item" className={cn("relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-8 text-sm outline-none focus:bg-violet-50 focus:text-violet-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-violet-950 dark:focus:text-violet-100", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><span className="absolute right-2 flex size-4 items-center justify-center"><SelectPrimitive.ItemIndicator><CheckIcon className="size-4 text-violet-600" /></SelectPrimitive.ItemIndicator></span></SelectPrimitive.Item>
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
