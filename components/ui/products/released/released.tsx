"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useGetMyListingsQuery,
  useUpdateListingStatusMutation,
} from "@/lib/api/sellerApi";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductTableToolbar } from "@/components/ui/products/product-table-toolbar";
import { ProductTablePagination } from "@/components/ui/products/product-table-pagination";
import { ProductDetailModal } from "@/components/ui/products/product-detail-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

type ApiProduct = {
  uuid?: string;
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  fullPrice?: number;
  discountPrice?: number | null;
  stockQty?: number;
  stock?: number;
  status?: string;
  views?: number;
  viewCount?: number;
  sold?: number;
  createdAt?: string;
  thumbnailUri?: string | { uri?: string };
  images?: Array<{
    uri?: string;
    url?: string;
    isPrimary?: boolean;
    is_primary?: boolean;
  }>;
};
type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stockQty: number;
  status: string;
  views: number;
  image?: string;
  createdAt?: string;
};

function responseItems(value: unknown): ApiProduct[] {
  if (Array.isArray(value)) return value;
  const response = value as { content?: unknown; data?: unknown } | undefined;
  return (
    Array.isArray(response?.content)
      ? response.content
      : Array.isArray(response?.data)
        ? response.data
        : []
  ) as ApiProduct[];
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "grid size-[22px] place-items-center rounded-[5px] border",
        checked
          ? "border-[#2f80ed] bg-[#2f80ed] text-white"
          : "border-[#c7ccd1] bg-white",
      )}
    >
      {checked && <Check className="size-4" strokeWidth={3} />}
    </button>
  );
}

function ProductImage({ product, compact = false }: { product: Product; compact?: boolean }) {
  const sizeClass = compact ? "size-[56px]" : "size-[76px]";
  return product.image ? (
    <div className={cn("relative shrink-0 overflow-hidden rounded-lg bg-muted", sizeClass)}>
      <Image
        src={product.image}
        alt={product.title}
        fill
        sizes={compact ? "56px" : "76px"}

        className="object-cover"
      />
    </div>
  ) : (
    <div className={cn("grid shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#c9b7ff] to-[#8068e8] font-bold text-white", sizeClass, compact ? "text-lg" : "text-2xl")}>
      {product.title[0]?.toUpperCase()}
    </div>
  );
}

const viewLabel = (views: number) =>
  views >= 1000 ? `${Math.round(views / 100) / 10}k` : String(views);

export function Released() {
  const { data, isLoading, isError, refetch } = useGetMyListingsQuery({
    pageNumber: 0,
    pageSize: 100,
  });
  const [archiveListing, { isLoading: isDeleting }] = useUpdateListingStatusMutation();
  const products = React.useMemo<Product[]>(
    () =>
      responseItems(data).map((item, index) => {
        const primary =
          item.images?.find((image) => image.isPrimary || image.is_primary) ??
          item.images?.[0];
        return {
          id: item.uuid ?? item.id ?? item.slug ?? String(index),
          slug: item.slug ?? item.uuid ?? item.id ?? String(index),
          title: item.title ?? item.name ?? "Untitled product",
          description: item.description ?? "",
          price: Number(item.fullPrice ?? item.price ?? 0),
          discountPrice:
            item.discountPrice == null ? null : Number(item.discountPrice),
          stockQty: Number(item.stockQty ?? item.stock ?? 0),
          status: item.status ?? "ACTIVE",
          views: Number(item.viewCount ?? item.views ?? item.sold ?? 0),
          createdAt: item.createdAt,
          image:
            typeof item.thumbnailUri === "string"
              ? item.thumbnailUri
              : (item.thumbnailUri?.uri ?? primary?.uri ?? primary?.url),
        };
      }),
    [data],
  );
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = React.useState<Set<string>>(new Set());
  const [query, setQuery] = React.useState("");
  const [createdDate, setCreatedDate] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState(
    () =>
      new Set([
        "product",
        "price",
        "discountPrice",
        "stock",
        "status",
        "actions",
      ]),
  );
  const [page, setPage] = React.useState(0);
  const [view] = React.useState<"list" | "grid">("list");
  const releasedProducts = products.filter(
    (p) =>
      !removedIds.has(p.id) &&
      !["DRAFT", "ARCHIVED"].includes(p.status.toUpperCase()),
  );
  const filteredProducts = releasedProducts.filter(
    (p) =>
      (!createdDate || p.createdAt?.slice(0, 10) === createdDate) &&
      `${p.title} ${p.description} ${p.status}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const totalPages = Math.ceil(filteredProducts.length / 10);
  const visible = filteredProducts.slice(page * 10, page * 10 + 10);
  const allSelected =
    visible.length > 0 && visible.every((p) => selected.has(p.id));
  const toggle = (id: string) =>
    setSelected((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((old) => {
      const next = new Set(old);
      visible.forEach((p) =>
        allSelected ? next.delete(p.id) : next.add(p.id),
      );
      return next;
    });
  const toggleColumn = (key: string) =>
    setVisibleColumns((old) => {
      const next = new Set(old);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const [deleteError, setDeleteError] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(null);
  const [viewProductUuid, setViewProductUuid] = React.useState<string | null>(null);

  async function deleteProduct() {
    if (!pendingDelete) return;
    const { id: uuid } = pendingDelete;
    setDeleteError("");
    setRemovedIds((current) => new Set(current).add(uuid));
    try {
      // Listings use a soft-delete lifecycle. Archiving removes the product
      // from the released catalogue without triggering the upstream DELETE 500.
      await archiveListing({ uuid, status: "ARCHIVED" }).unwrap();
      await refetch();
      setSelected((current) => {
        const next = new Set(current);
        next.delete(uuid);
        return next;
      });
      toast.success("Product removed successfully.");
      setPendingDelete(null);
    } catch (error) {
      setRemovedIds((current) => {
        const next = new Set(current);
        next.delete(uuid);
        return next;
      });
      const apiError = error as { data?: { message?: string } };
      setDeleteError(apiError.data?.message ?? "Could not remove the product. Please try again.");
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-1 flex-col bg-[#f7f7f8] px-7 py-7 text-[#27282b] sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-tight">Released</h1>
        <Link href="/seller-dashboard/products/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6C4CD8] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5d3fc4]">
          <Plus className="size-4" /> Add new product
        </Link>
      </div>
      <div className="rounded-xl bg-white p-5">
        <ProductTableToolbar
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(0);
          }}
          createdDate={createdDate}
          onCreatedDateChange={(value) => {
            setCreatedDate(value);
            setPage(0);
          }}
          columns={[
            { key: "product", label: "Product" },
            { key: "price", label: "Price" },
            { key: "discountPrice", label: "Discount price" },
            { key: "stock", label: "Stock" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          visibleColumns={visibleColumns}
          onToggleColumn={toggleColumn}
        />
        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading your products...
          </div>
        ) : isError ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <p>Unable to load your products.</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg bg-[#8068e8] px-4 py-2 text-white"
            >
              Try again
            </button>
          </div>
        ) : view === "list" ? (
          <Table className="table-fixed">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[32%]" />
              <col className="w-[12.6%]" />
              <col className="w-[12.6%]" />
              <col className="w-[12.6%]" />
              <col className="w-[12.6%]" />
              <col className="w-[12.6%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="h-12 hover:bg-transparent">
                <TableHead className="px-4">
                  <Checkbox
                    checked={allSelected}
                    onChange={toggleAll}
                    label="Select all products"
                  />
                </TableHead>
                <TableHead
                  className={cn(
                    "text-[13px] font-bold uppercase tracking-[0.08em] text-[#596273]",
                    !visibleColumns.has("product") && "hidden",
                  )}
                >
                  Product
                </TableHead>
                <TableHead
                  className={cn(
                    "text-center text-[13px] font-bold uppercase tracking-[0.08em] text-[#596273]",
                    !visibleColumns.has("price") && "hidden",
                  )}
                >
                  Price
                </TableHead>
                <TableHead
                  className={cn(
                    "text-center text-[13px] font-bold uppercase tracking-[0.08em] text-[#596273]",
                    !visibleColumns.has("discountPrice") && "hidden",
                  )}
                >
                  Discount price
                </TableHead>
                <TableHead
                  className={cn(
                    "text-center text-[13px] font-bold uppercase tracking-[0.08em] text-[#596273]",
                    !visibleColumns.has("stock") && "hidden",
                  )}
                >
                  Stock
                </TableHead>
                <TableHead
                  className={cn(
                    "text-center text-[13px] font-bold uppercase tracking-[0.08em] text-[#596273]",
                    !visibleColumns.has("status") && "hidden",
                  )}
                >
                  Status
                </TableHead>
                <TableHead
                  className={cn(
                    "text-center text-[13px] font-bold uppercase tracking-[0.08em] text-[#596273]",
                    !visibleColumns.has("actions") && "hidden",
                  )}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => (
                <TableRow
                  key={p.id}
                  data-state={selected.has(p.id) ? "selected" : undefined}
                  className="h-20"
                >
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      label={`Select ${p.title}`}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(!visibleColumns.has("product") && "hidden")}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <ProductImage product={p} compact />
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{p.title}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {p.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-base font-semibold",
                      !visibleColumns.has("price") && "hidden",
                    )}
                  >
                    ${p.price.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-base font-semibold text-emerald-600",
                      !visibleColumns.has("discountPrice") && "hidden",
                    )}
                  >
                    {p.discountPrice == null
                      ? "—"
                      : `$${p.discountPrice.toFixed(2)}`}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-base font-semibold",
                      !visibleColumns.has("stock") && "hidden",
                    )}
                  >
                    {p.stockQty}
                  </TableCell>
                  <TableCell
                    className={cn("text-center", !visibleColumns.has("status") && "hidden")}
                  >
                    <span className="inline-flex items-center justify-center gap-2 text-sm font-medium">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          p.status.toUpperCase() === "ACTIVE"
                            ? "bg-emerald-500"
                            : "bg-slate-400",
                        )}
                      />
                      {p.status.toUpperCase() === "ARCHIVED" ? "Inactive" : p.status}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(!visibleColumns.has("actions") && "hidden")}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" aria-label={`Actions for ${p.title}`} className="mx-auto grid size-9 place-items-center rounded-lg hover:bg-muted"><MoreHorizontal className="size-6" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={6} className="w-44 p-1.5">
                        <DropdownMenuItem onSelect={() => setViewProductUuid(p.id)} className="cursor-pointer rounded-lg"><Eye className="size-4" />View</DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg"><Link href={`/seller-dashboard/products/new?edit=${p.id}`}><Pencil className="size-4" />Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem disabled={isDeleting} onClick={() => { setDeleteError(""); setPendingDelete(p); }} className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600"><Trash2 className="size-4" />{isDeleting ? "Removing..." : "Delete"}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <article
                key={p.id}
                className="relative flex items-center gap-4 rounded-xl border p-4"
              >
                <div className="absolute right-3 top-3">
                  <Checkbox
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    label={`Select ${p.title}`}
                  />
                </div>
                <ProductImage product={p} />
                <div className="min-w-0 pr-6">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="text-xs text-emerald-600">
                    {p.status} · {viewLabel(p.views)} views
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
        {!isLoading && !isError && visible.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            {query
              ? "No products match your search."
              : "You have not posted any products yet."}
          </p>
        )}
        <ProductTablePagination
          page={page}
          totalPages={totalPages}
          selectedCount={
            visible.filter((product) => selected.has(product.id)).length
          }
          rowCount={visible.length}
          onPageChange={setPage}
        />
      </div>
      <ProductDetailModal uuid={viewProductUuid} onClose={() => setViewProductUuid(null)} />

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) setPendingDelete(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            aria-describedby="delete-product-description"
            className="w-full max-w-md rounded-[28px] bg-white px-7 py-8 text-center shadow-[0_28px_80px_rgba(15,23,42,0.3)] sm:px-9"
          >
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="size-9" strokeWidth={2.2} />
            </span>
            <h2 id="delete-product-title" className="mt-5 text-2xl font-bold text-slate-900">
              Delete product?
            </h2>
            <p id="delete-product-description" className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              You&apos;re about to permanently delete <strong className="font-semibold text-slate-800">“{pendingDelete.title}”</strong>. This action cannot be undone.
            </p>
            {deleteError && (
              <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50 text-left">
                <AlertTriangle className="size-4" />
                <AlertTitle>Unable to remove product</AlertTitle>
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPendingDelete(null)}
                className="h-12 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                No, keep it
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={deleteProduct}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {isDeleting ? "Removing..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
