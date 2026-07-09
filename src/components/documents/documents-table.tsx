"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnOrderState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GripVertical,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateShort, cn } from "@/lib/utils";
import type { PolicyDocument } from "@/types/policy-document";

const COLUMN_LABELS: Record<string, string> = {
  documentDate: "Datum",
  title: "Titel",
  policyLayer: "Beleidslaag",
  documentType: "Documentsoort",
  governmentLevel: "Bestuurslaag",
  organisation: "Organisatie",
  province: "Provincie",
  theme: "Thema",
  portfolioHolder: "Portefeuillehouder",
  status: "Status",
  meeting: "Vergadering",
  link: "Link",
};

interface DocumentsTableProps {
  documents: PolicyDocument[];
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "documentDate", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<PolicyDocument>[]>(
    () => [
      {
        accessorKey: "documentDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Datum
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => formatDateShort(row.original.documentDate),
        sortingFn: "datetime",
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Titel
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/documents/${row.original.id}`}
            className="font-medium text-primary hover:underline line-clamp-2"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "policyLayer",
        header: "Beleidslaag",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {row.original.policyLayer}
          </Badge>
        ),
      },
      {
        accessorKey: "documentType",
        header: "Documentsoort",
        cell: ({ row }) => (
          <span className="text-xs">{row.original.documentType}</span>
        ),
      },
      {
        accessorKey: "governmentLevel",
        header: "Bestuurslaag",
      },
      {
        accessorKey: "organisation",
        header: "Organisatie",
        cell: ({ row }) => (
          <span className="line-clamp-1 text-xs">{row.original.organisation}</span>
        ),
      },
      {
        accessorKey: "province",
        header: "Provincie",
      },
      {
        accessorKey: "theme",
        header: "Thema",
      },
      {
        accessorKey: "portfolioHolder",
        header: "Portefeuillehouder",
        cell: ({ row }) => (
          <span className="line-clamp-1 text-xs">
            {row.original.portfolioHolder}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "Aangenomen"
                ? "default"
                : row.original.status === "Verworpen"
                  ? "destructive"
                  : "secondary"
            }
            className="text-xs"
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "meeting",
        header: "Vergadering",
        cell: ({ row }) => (
          <span className="line-clamp-1 text-xs">{row.original.meeting}</span>
        ),
      },
      {
        id: "link",
        header: "Link",
        enableSorting: false,
        cell: ({ row }) => (
          <a
            href={row.original.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </a>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: documents,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      columnOrder: columnOrder.length > 0 ? columnOrder : undefined,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const doc = row.original;
      return (
        doc.title.toLowerCase().includes(search) ||
        doc.organisation.toLowerCase().includes(search) ||
        doc.documentType.toLowerCase().includes(search) ||
        doc.theme.toLowerCase().includes(search) ||
        doc.dossier.toLowerCase().includes(search)
      );
    },
    initialState: {
      pagination: { pageSize: 25 },
    },
  });

  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetId) return;

    const currentOrder =
      columnOrder.length > 0
        ? columnOrder
        : table.getAllLeafColumns().map((c) => c.id);

    const fromIndex = currentOrder.indexOf(draggedColumn);
    const toIndex = currentOrder.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, draggedColumn);
    setColumnOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Snel zoeken in tabel…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm h-8 text-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings2 className="h-4 w-4" />
                Kolommen
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Zichtbare kolommen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllLeafColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {COLUMN_LABELS[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} resultaten
          </span>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-10 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap"
                      draggable
                      onDragStart={() => handleDragStart(header.column.id)}
                      onDragOver={(e) => handleDragOver(e, header.column.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3 cursor-grab text-muted-foreground/50" />
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Geen documenten gevonden
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 align-top">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Pagina {table.getState().pagination.pageIndex + 1} van{" "}
            {table.getPageCount() || 1}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded border bg-background px-2 py-1 text-xs"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} per pagina
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
