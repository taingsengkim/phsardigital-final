"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  MoreHorizontal,
  Eye,
  Power,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { cn, getFileUrl } from "@/lib/utils";
import {
  useGetMyListingsQuery,
  useUpdateListingStatusMutation,
} from "@/lib/api/sellerApi";
import { readSellerDrafts, writeSellerDrafts } from "@/lib/seller-drafts";
import { ProductTableToolbar } from "@/components/ui/products/product-table-toolbar";
import { ProductTablePagination } from "@/components/ui/products/product-table-pagination";
import { ProductDetailModal } from "@/components/ui/products/product-detail-modal";
import { useDeleteSellerListingMutation } from "@/lib/redux/service/sellerProductApi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DraftProduct = {
  id: string;
  title: string;
  url: string;
  price: string;
  discountPrice: string;
  stockQty: number;
  views: number;
  editedAt: string;
  createdAt: string;
  art: string;
  image?: string;
};

const draftArt = [
  "from-[#86d8ff] via-[#ffd0d8] to-[#ad87db]",
  "from-[#ffb55c] via-[#ef835d] to-[#f1ded3]",
  "from-[#8ed9dc] via-[#dfd2c9] to-[#edae9c]",
];

function draftImage(item: Record<string, unknown>): string | undefined {
  const images = Array.isArray(item.images)
    ? (item.images as Array<Record<string, unknown>>)
    : [];
  const primary =
    images.find((image) => image.isPrimary || image.is_primary) ?? images[0];
  const thumbnail = item.thumbnailUri;
  if (typeof thumbnail === "string") return getFileUrl(thumbnail);
  const thumbnailUri =
    thumbnail && typeof thumbnail === "object"
      ? (thumbnail as Record<string, unknown>).uri
      : undefined;
  const objectName =
    typeof item.thumbnailObjectName === "string"
      ? item.thumbnailObjectName
      : Array.isArray(item.imageNames) && typeof item.imageNames[0] === "string"
        ? item.imageNames[0]
        : undefined;
  return (
    getFileUrl(
      String(thumbnailUri ?? primary?.uri ?? primary?.url ?? objectName ?? ""),
    ) || undefined
  );
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
        "grid size-[22px] shrink-0 place-items-center rounded-[5px] border transition-colors",
        checked
          ? "border-[#2f80ed] bg-[#2f80ed] text-white"
          : "border-[#c7ccd1] bg-white hover:border-[#8f99a3]",
      )}
    >
      {checked && <Check className="size-[15px]" strokeWidth={3} />}
    </button>
  );
}

function ProductArtwork({
  art,
  index,
  image,
  title,
}: {
  art: string;
  index: number;
  image?: string;
  title: string;
}) {
  if (image)
    return (
      <div className="relative size-[56px] shrink-0 overflow-hidden rounded-[8px] bg-muted">
        <Image
          src={image}
          alt={title}
          fill
          sizes="56px"
          unoptimized={image.startsWith("http")}
          className="object-cover"
        />
      </div>
    );
  return (
    <div
      className={cn(
        "relative size-[56px] shrink-0 overflow-hidden rounded-[8px] bg-gradient-to-br",
        art,
      )}
      aria-hidden="true"
    >
      <span className="absolute -bottom-3 left-3 h-10 w-16 rotate-[-13deg] rounded-full bg-white/55 blur-[1px]" />
      <span className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[30%] bg-white/40 shadow-lg" />
      <span
        className={cn(
          "absolute h-12 w-3 rounded-full bg-white/70",
          index % 2
            ? "right-4 top-3 rotate-[18deg]"
            : "left-5 top-2 rotate-[-22deg]",
        )}
      />
    </div>
  );
}

export function Drafts({
  variant = "drafts",
}: {
  variant?: "drafts" | "schedualed";
}) {
  const isScheduled = variant === "schedualed";
  const { data: serverDraftData, refetch: refetchDrafts } = useGetMyListingsQuery(
    { status: "DRAFT", pageNumber: 0, pageSize: 100 },
    { skip: isScheduled },
  );
  const [updateListingStatus] = useUpdateListingStatusMutation();
  const [deleteListing, { isLoading: isDeleting }] = useDeleteSellerListingMutation();
  const [products, setProducts] = React.useState<DraftProduct[]>(() =>
    isScheduled
      ? []
      : readSellerDrafts().map((draft, index) => ({
          id: draft.id,
          title: draft.title,
          url: draft.imageNames.length
            ? draft.imageNames.join(", ")
            : "No images added",
          price: draft.price ? `$${draft.price}` : "$0.00",
          discountPrice: draft.discountPrice ? `$${Number(draft.discountPrice).toFixed(2)}` : "—",
          stockQty: Number(draft.stockQty || 0),
          views: 0,
          editedAt: new Date(draft.updatedAt).toLocaleString(),
          createdAt: draft.updatedAt,
          art: draftArt[index % draftArt.length],
        })),
  );
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = React.useState<Set<string>>(new Set());
  const [viewProductUuid, setViewProductUuid] = React.useState<string | null>(null);
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

  const serverItems = React.useMemo(() => {
    const response = serverDraftData as
      | Array<Record<string, unknown>>
      | {
          content?: Array<Record<string, unknown>>;
          data?: Array<Record<string, unknown>>;
        }
      | undefined;
    const items = Array.isArray(response)
      ? response
      : (response?.content ?? response?.data ?? []);
    return items.map((item, index): DraftProduct => ({
      id: String(item.uuid ?? item.id ?? index),
      title: String(item.title ?? "Untitled product"),
      url: String(item.description ?? "Server draft"),
      price: `$${Number(item.fullPrice ?? item.price ?? 0).toFixed(2)}`,
      discountPrice:
        item.discountPrice == null
          ? "—"
          : `$${Number(item.discountPrice).toFixed(2)}`,
      stockQty: Number(item.stockQty ?? item.stock ?? 0),
      views: Number(item.viewCount ?? item.views ?? item.sold ?? 0),
      editedAt:
        item.lastModifiedAt || item.updatedAt || item.createdAt
          ? new Date(
              String(item.lastModifiedAt ?? item.updatedAt ?? item.createdAt),
            ).toLocaleString()
          : "Recently edited",
      createdAt: String(
        item.createdAt ?? item.updatedAt ?? item.lastModifiedAt ?? "",
      ),
      art: draftArt[index % draftArt.length],
      image: draftImage(item),
    }));
  }, [serverDraftData]);
  const allProducts = [
    ...products,
    ...serverItems.filter(
      (server) => !removedIds.has(server.id) && !products.some((local) => local.id === server.id),
    ),
  ];
  const serverIds = new Set(serverItems.map((item) => item.id));
  const filteredProducts = allProducts.filter(
    (product) =>
      (!createdDate || product.createdAt.slice(0, 10) === createdDate) &&
      `${product.title} ${product.url}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredProducts.length / 10);
  const visibleProducts = filteredProducts.slice(page * 10, page * 10 + 10);
  const allVisibleSelected =
    visibleProducts.length > 0 &&
    visibleProducts.every((product) => selected.has(product.id));
  const toggleColumn = (key: string) =>
    setVisibleColumns((old) => {
      const next = new Set(old);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected)
        visibleProducts.forEach((product) => next.delete(product.id));
      else visibleProducts.forEach((product) => next.add(product.id));
      return next;
    });
  }

  async function removeDraft(product: DraftProduct) {
    const isServerProduct = serverIds.has(product.id);
    setRemovedIds((current) => new Set(current).add(product.id));
    setProducts((items) => items.filter((item) => item.id !== product.id));
    setSelected((items) => {
      const next = new Set(items);
      next.delete(product.id);
      return next;
    });
    if (!isServerProduct) {
      writeSellerDrafts(readSellerDrafts().filter((draft) => draft.id !== product.id));
      return;
    }
    try {
      await deleteListing({ uuid: product.id }).unwrap();
      await refetchDrafts();
    } catch {
      setRemovedIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-1 flex-col bg-[#f7f7f8] px-7 py-7 text-[#27282b] sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-tight">
          {isScheduled ? "Scheduled" : "Drafts"}
        </h1>
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

        <Table className="table-fixed text-base">
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
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="px-6">
                <Checkbox
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  label="Select all products"
                />
              </TableHead>
              <TableHead
                className={cn(
                  "text-sm font-bold uppercase tracking-[0.08em] text-[#596273]",
                  !visibleColumns.has("product") && "hidden",
                )}
              >
                Product
              </TableHead>
              <TableHead
                className={cn(
                  "text-center text-sm font-bold uppercase tracking-[0.08em] text-[#596273]",
                  !visibleColumns.has("price") && "hidden",
                )}
              >
                Price
              </TableHead>
              <TableHead
                className={cn(
                  "text-center text-sm font-bold uppercase tracking-[0.08em] text-[#596273]",
                  !visibleColumns.has("discountPrice") && "hidden",
                )}
              >
                Discount price
              </TableHead>
              <TableHead
                className={cn(
                  "text-center text-sm font-bold uppercase tracking-[0.08em] text-[#596273]",
                  !visibleColumns.has("stock") && "hidden",
                )}
              >
                Stock
              </TableHead>
              <TableHead
                className={cn(
                  "text-center text-sm font-bold uppercase tracking-[0.08em] text-[#596273]",
                  !visibleColumns.has("status") && "hidden",
                )}
              >
                Status
              </TableHead>
              <TableHead
                className={cn(
                  "text-center text-sm font-bold uppercase tracking-[0.08em] text-[#596273]",
                  !visibleColumns.has("actions") && "hidden",
                )}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleProducts.map((product, index) => (
              <TableRow
                key={product.id}
                data-state={selected.has(product.id) ? "selected" : undefined}
                className="h-24"
              >
                <TableCell className="px-6">
                  <Checkbox
                    checked={selected.has(product.id)}
                    onChange={() => toggle(product.id)}
                    label={`Select ${product.title}`}
                  />
                </TableCell>
                <TableCell
                  className={cn(!visibleColumns.has("product") && "hidden")}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <ProductArtwork
                      art={product.art}
                      index={index}
                      image={product.image}
                      title={product.title}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                        {product.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {product.url}
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
                  {product.price}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-center text-base font-semibold text-emerald-600",
                    !visibleColumns.has("discountPrice") && "hidden",
                  )}
                >
                  {product.discountPrice}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-center text-base font-semibold",
                    !visibleColumns.has("stock") && "hidden",
                  )}
                >
                  {product.stockQty}
                </TableCell>
                <TableCell
                  className={cn("text-center", !visibleColumns.has("status") && "hidden")}
                >
                  <span className="inline-flex items-center justify-center gap-2 text-sm font-medium">
                    <span className="size-2 rounded-full bg-amber-400" />
                    Draft
                  </span>
                </TableCell>
                <TableCell
                  className={cn(!visibleColumns.has("view") && "hidden")}
                >
                  {serverIds.has(product.id) ? (
                    <button
                      type="button"
                      onClick={() => setViewProductUuid(product.id)}
                      aria-label={`View ${product.title}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#596273] hover:text-[#8068e8]"
                    >
                      <Eye className="size-4" />
                      View
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell
                  className={cn(!visibleColumns.has("actions") && "hidden")}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" aria-label={`Actions for ${product.title}`} className="mx-auto grid size-9 place-items-center rounded-lg hover:bg-muted"><MoreHorizontal className="size-6" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-44 p-1.5">
                      {serverIds.has(product.id) && (
                        <DropdownMenuItem onSelect={() => setViewProductUuid(product.id)} className="cursor-pointer rounded-lg"><Eye className="size-4" />View</DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg"><Link href={`/seller-dashboard/products/new?edit=${product.id}`}><Pencil className="size-4" />Edit</Link></DropdownMenuItem>
                      {serverIds.has(product.id) && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              updateListingStatus({
                                uuid: product.id,
                                status: "ACTIVE",
                              })
                            }
                            className="cursor-pointer rounded-lg"
                          >
                            <Power className="size-4" />
                            Set active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateListingStatus({
                                uuid: product.id,
                                status: "ARCHIVED",
                              })
                            }
                            className="cursor-pointer rounded-lg"
                          >
                            <Power className="size-4" />
                            Set inactive
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        disabled={isDeleting}
                        onClick={() => removeDraft(product)}
                        className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600"
                      >
                        <Trash2 className="size-4" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ProductDetailModal uuid={viewProductUuid} onClose={() => setViewProductUuid(null)} />

        {visibleProducts.length === 0 && (
          <p className="py-[60px] text-center text-[13px] text-[#858c95]">
            No draft products found.
          </p>
        )}
        <ProductTablePagination
          page={page}
          totalPages={totalPages}
          selectedCount={
            visibleProducts.filter((product) => selected.has(product.id)).length
          }
          rowCount={visibleProducts.length}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
