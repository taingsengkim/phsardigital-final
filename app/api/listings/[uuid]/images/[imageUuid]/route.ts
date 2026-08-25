import { NextRequest } from "next/server";
import { proxyAuthenticated } from "@/lib/api/authenticated-proxy";

/** DELETE /api/v1/listings/{uuid}/images/{imageUuid} — destroys the file upstream. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string; imageUuid: string }> },
) {
  const { uuid, imageUuid } = await params;
  return proxyAuthenticated(
    request,
    `/api/v1/listings/${encodeURIComponent(uuid)}/images/${encodeURIComponent(imageUuid)}`,
  );
}
