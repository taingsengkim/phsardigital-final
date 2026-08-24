type ApiErrorShape = {
  status?: number;
  data?: {
    message?: string;
    errorDetails?: { field?: string; fieldMessage?: string }[];
  };
};

/** Raw Postgres/Hibernate text is for the logs, never for a seller to read. */
function looksLikeRawDbError(detail: string): boolean {
  return /^ERROR:|violates |constraint "/i.test(detail);
}

/**
 * The API's top-level `message` is generic ("The request conflicts with data
 * that already exists") — the real reason is in `errorDetails[0].fieldMessage`.
 *
 * A 409 is not always a duplicate: a foreign-key violation means something
 * still points at the row the server tried to remove, which needs the opposite
 * advice from "pick a different value". Pass `duplicateMessage` for the field
 * this form could genuinely collide on.
 */
export function readApiError(
  err: unknown,
  fallback: string,
  duplicateMessage?: string,
): string {
  const e = err as ApiErrorShape;
  const detail = e?.data?.errorDetails?.[0]?.fieldMessage ?? "";

  if (e?.status === 409) {
    if (/foreign key constraint/i.test(detail)) {
      if (/\bfiles\b/i.test(detail) && /\blistings\b/i.test(detail)) {
        return "That image is still attached to one of your listings, so it cannot be replaced here. Use a different image, or remove it from the listing first.";
      }
      return "This change cannot be applied because other records still depend on the data being changed.";
    }
    if (duplicateMessage) return duplicateMessage;
  }

  if (detail && !looksLikeRawDbError(detail)) return detail;
  return e?.data?.message || fallback;
}
