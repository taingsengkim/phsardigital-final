import type { UploadedFile } from "@/lib/types/seller-product"

/**
 * Uploads one file to POST /api/v1/files/upload-multiple and reports progress.
 *
 * XHR rather than fetch: fetch cannot report upload progress, and the gallery
 * has to show a per-file bar while bytes are still moving.
 *
 * One request per file, even though the endpoint accepts a batch. The spec asks
 * for per-file progress and for a partial failure to keep the successes — a
 * single batched request gives one progress figure and one all-or-nothing
 * result, so a photo that fails would take its siblings down with it. The
 * attach step (POST /listings/{uuid}/images) is per-file regardless.
 */
export function uploadGalleryFile(
  file: File,
  onProgress: (percent: number) => void,
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const body = new FormData()
    body.append("files", file)

    const request = new XMLHttpRequest()
    request.open("POST", "/api/files/upload-multiple")

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })

    request.addEventListener("load", () => {
      let payload: unknown = null
      try {
        payload = request.responseText ? JSON.parse(request.responseText) : null
      } catch {
        payload = null
      }

      if (request.status < 200 || request.status >= 300) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message?: unknown }).message)
            : `Upload failed (${request.status})`
        reject(new Error(message))
        return
      }

      /* The endpoint answers with an array; one file in, one entry out. */
      const uploaded = Array.isArray(payload) ? payload[0] : payload
      const objectName = (uploaded as UploadedFile | null)?.objectName
      if (!objectName) {
        reject(new Error("The upload did not return a storage key"))
        return
      }
      resolve(uploaded as UploadedFile)
    })

    request.addEventListener("error", () =>
      reject(new Error("Network error during upload")),
    )
    request.addEventListener("abort", () =>
      reject(new Error("Upload was cancelled")),
    )

    request.send(body)
  })
}
