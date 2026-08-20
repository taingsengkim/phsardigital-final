"use client"

export function ProductTablePagination({ page, totalPages, selectedCount, rowCount, onPageChange }: { page: number; totalPages: number; selectedCount: number; rowCount: number; onPageChange: (page: number) => void }) {
  return <nav aria-label="Product table pagination" className="flex min-h-20 items-center border-t border-[#eceef0] px-2 text-sm text-[#68717d]">
    <p>{selectedCount} of {rowCount} row(s) selected.</p>
    <div className="ml-auto flex gap-2">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 0} className="h-10 rounded-lg border border-[#e3e5e8] px-4 font-medium text-[#515761] hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45">Previous</button>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={totalPages === 0 || page >= totalPages - 1} className="h-10 rounded-lg border border-[#e3e5e8] px-4 font-medium text-[#515761] hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45">Next</button>
    </div>
  </nav>
}
