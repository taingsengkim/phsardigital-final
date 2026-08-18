export function getFileUrl(objectName?: string | null): string {
  if (!objectName) return "";
  if (
    objectName.startsWith("http://") ||
    objectName.startsWith("https://") ||
    objectName.startsWith("/")
  ) {
    return objectName;
  }
  const baseUrl =
    process.env.NEXT_PUBLIC_FILE_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}/${objectName}` : objectName;
}
