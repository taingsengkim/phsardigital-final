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
