function notifyFavoritesUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("favorites-updated"));
  }
}

export async function getFavorites(): Promise<any[]> {
  try {
    const res = await fetch("/api/favorites", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.content)) return data.content;
      if (data && Array.isArray(data.data)) return data.data;
    }
  } catch (err) {
    console.warn("Failed to fetch favorites from route handler:", err);
  }

  return [];
}

export async function addFavorite(listingUuid: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/favorites/${listingUuid}`, {
      method: "POST",
    });
    if (res.ok) {
      notifyFavoritesUpdated();
      return true;
    }
  } catch (err) {
    console.warn("Failed to add favorite:", err);
  }
  notifyFavoritesUpdated();
  return false;
}

export async function removeFavorites(uuids: string[]): Promise<boolean> {
  try {
    const res = await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uuids),
    });
    if (res.ok) {
      notifyFavoritesUpdated();
      return true;
    }
  } catch (err) {
    console.warn("Failed to remove favorite(s):", err);
  }
  notifyFavoritesUpdated();
  return false;
}
