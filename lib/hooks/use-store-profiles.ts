"use client";

import * as React from "react";

export type StoreIdentity = { businessName?: string; logoUri?: string };

/**
 * A conversation only names the other *user* — for a buyer that reads as the
 * shop owner's personal account rather than the shop. Seller profiles are keyed
 * by the owner's user id, so `otherUserId` resolves straight to the storefront.
 *
 * Cached across mounts; a `null` entry marks an id that is not a store, so we
 * stop asking for it.
 */
const cache = new Map<string, StoreIdentity | null>();

async function resolveStore(userId: string): Promise<void> {
  try {
    const response = await fetch(`/api/sellers/${encodeURIComponent(userId)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      cache.set(userId, null); // not a seller — keep the user's own name
      return;
    }
    const profile = (await response.json()) as StoreIdentity | null;
    cache.set(userId, profile?.businessName ? profile : null);
  } catch {
    // leave it uncached so a later render can retry
  }
}

export function useStoreProfiles(
  userIds: string[],
): Record<string, StoreIdentity> {
  const [resolved, setResolved] = React.useState<Record<string, StoreIdentity>>(
    {},
  );
  // A stable dependency — the array identity changes on every render.
  const key = Array.from(new Set(userIds.filter(Boolean)))
    .sort()
    .join(",");

  React.useEffect(() => {
    const ids = key ? key.split(",") : [];
    let cancelled = false;

    async function run() {
      await Promise.all(
        ids.filter((id) => !cache.has(id)).map((id) => resolveStore(id)),
      );
      if (cancelled) return;
      const next: Record<string, StoreIdentity> = {};
      for (const id of ids) {
        const entry = cache.get(id);
        if (entry) next[id] = entry;
      }
      setResolved(next);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return resolved;
}
