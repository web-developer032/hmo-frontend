"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils/cn";

export type DataTableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

function headerMeta(
  col: { columnDef: { meta?: unknown } }
): DataTableColumnMeta | undefined {
  return col.columnDef.meta as DataTableColumnMeta | undefined;
}

function cellMeta(
  col: { columnDef: { meta?: unknown } }
): DataTableColumnMeta | undefined {
  return col.columnDef.meta as DataTableColumnMeta | undefined;
}

/** Use with a manual `<tbody>` when rows need custom markup (e.g. inline editors). */
export function DataTableHeader<TData, TValue>({
  columns,
}: {
  columns: ColumnDef<TData, TValue>[];
}) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages internal mutable refs by design.
  const table = useReactTable({
    data: [] as TData[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <thead>
      {table.getHeaderGroups().map((hg) => (
        <tr
          key={hg.id}
          className="border-b border-[var(--border-design)] text-xs uppercase tracking-[0.12em] text-muted"
        >
          {hg.headers.map((h) => (
            <th
              key={h.id}
              className={cn(
                "pb-3 pr-4 font-semibold",
                headerMeta(h.column)?.headerClassName
              )}
            >
              {h.isPlaceholder
                ? null
                : flexRender(h.column.columnDef.header, h.getContext())}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  emptyMessage = "No rows.",
  getRowId,
  className,
  tableClassName,
  minTableWidth,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  getRowId?: (originalRow: TData, index: number, parent?: unknown) => string;
  className?: string;
  tableClassName?: string;
  /** e.g. min-w-[560px] for wide tables */
  minTableWidth?: string;
}) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages internal mutable refs by design.
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (data.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table
        className={cn(
          "w-full min-w-0 text-left text-sm",
          minTableWidth,
          tableClassName
        )}
      >
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              className="border-b border-[var(--border-design)] text-xs uppercase tracking-[0.12em] text-muted"
            >
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className={cn(
                    "pb-3 pr-4 font-semibold",
                    headerMeta(h.column)?.headerClassName
                  )}
                >
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--border-design)] last:border-0"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    "py-4 pr-4 align-top",
                    cellMeta(cell.column)?.cellClassName
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
