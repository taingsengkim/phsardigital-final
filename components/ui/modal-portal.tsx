"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Mounts an overlay directly on <body>, escaping every ancestor stacking
 * context.
 *
 * A fixed overlay is only "on top of the page" if nothing above it in the tree
 * has trapped it: `position: sticky` creates a stacking context even at
 * `z-index: auto`, as do `transform`, `filter` and `will-change`. The product
 * gallery sits in a `lg:sticky` column, so its preview used to paint *below*
 * the sticky navbar no matter how high its own z-index went — the number is
 * scoped to the trapped context, not the page.
 *
 * Portalled children still need a z-index above the app chrome (the navbar is
 * z-50); the overlays here use z-[100].
 */
const neverChanges = () => () => {};

export function ModalPortal({ children }: { children: ReactNode }) {
  /* document only exists once hydrated. useSyncExternalStore is the canonical
     read for that — no setState in an effect, so no cascading render. */
  const hydrated = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );

  if (!hydrated) return null;
  return createPortal(children, document.body);
}
