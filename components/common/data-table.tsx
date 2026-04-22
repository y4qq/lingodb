import type { ReactNode } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  empty: ReactNode;
  rowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowIsSelected?: (row: T) => boolean;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  empty,
  rowHref,
  onRowClick,
  rowIsSelected,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground rounded-md border px-4 py-8 text-center text-sm">
        {empty}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.header} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const selected = rowIsSelected?.(row) ?? false;
            const clickable = Boolean(rowHref || onRowClick);
            return (
              <TableRow
                key={rowKey(row)}
                className={clickable ? "relative cursor-pointer" : undefined}
                data-state={selected ? "selected" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col, i) => (
                  <TableCell key={col.header} className={col.className}>
                    {i === 0 && rowHref && (
                      <Link
                        href={rowHref(row)}
                        tabIndex={-1}
                        aria-hidden
                        className="absolute inset-0"
                      />
                    )}
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
