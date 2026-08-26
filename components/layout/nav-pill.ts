/**
 * One height for every control in the navbar, declared rather than derived.
 *
 * The bar used to mix hard pixel values (inline `padding: 7px`, `fontSize: 13`)
 * with rem-based Tailwind classes. The root font-size is 85%, so the rem ones
 * shrank with it while the pixel ones did not, and the two could never line
 * up — Register stood ~5px taller than the Login button beside it. Deriving
 * height from padding + line-height also meant every differing text size
 * produced a differing height.
 */

/** Top bar: matches the h-8 sm:h-9 icon circles (Saved, Cart, Account). */
export const NAV_PILL =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-bold no-underline sm:h-9";

/** Purple rail: its own, shorter height — the pills there were 21px vs 25px. */
export const NAV_RAIL_PILL =
  "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12px] font-semibold no-underline";
