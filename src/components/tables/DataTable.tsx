import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  showIndex?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  showIndex = true,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const totalCount = total ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const pageRows = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {showIndex && <TableHead className="w-14">#</TableHead>}
              {columns.map((c) => (
                <TableHead key={c.key} className={cn("text-xs font-semibold", c.className)} style={{ width: c.width }}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {showIndex && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                  {columns.map((c) => (
                    <TableCell key={c.key}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showIndex ? 1 : 0)}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, idx) => (
                <TableRow key={rowKey(row)}>
                  {showIndex && (
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                  )}
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.cell(row, idx)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
        <span>
          Showing {from} to {to} of {totalCount} entries
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
            const p = i + 1;
            return (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange?.(p)}
              >
                {p}
              </Button>
            );
          })}
          {totalPages > 3 && <span className="px-2">...</span>}
          {totalPages > 3 && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(totalPages)}
            >
              {totalPages}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}