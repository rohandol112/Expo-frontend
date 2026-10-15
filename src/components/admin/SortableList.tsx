import type { ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
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

export interface SortableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
}

/**
 * Drag-to-reorder table for the Listing Categories / Sub Categories / Banners
 * pages. Not built into the shared DataTable so other list pages are
 * unaffected. Drag only reorders rows on the currently displayed page —
 * `onReorder` receives the full re-ordered array for that page's slice.
 */
export function SortableList<T>({
  columns,
  data,
  rowKey,
  onReorder,
  loading = false,
  emptyTitle,
  emptyDescription,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
}: {
  columns: SortableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onReorder: (nextPageRows: T[]) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}) {
  const totalCount = total ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const pageRows = data.slice((page - 1) * pageSize, page * pageSize);
  const ids = pageRows.map(rowKey);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(pageRows, oldIndex, newIndex));
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10" />
              <TableHead className="w-14">#</TableHead>
              {columns.map((c) => (
                <TableHead key={c.key} className={cn("text-xs font-semibold", c.className)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.key}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                  {pageRows.map((row, idx) => (
                    <SortableRow key={rowKey(row)} id={rowKey(row)} index={(page - 1) * pageSize + idx + 1}>
                      {columns.map((c) => (
                        <TableCell key={c.key} className={c.className}>
                          {c.cell(row, idx)}
                        </TableCell>
                      ))}
                    </SortableRow>
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
        <span>Showing {from} to {to} of {totalCount} entries</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
            const p = i + 1;
            return (
              <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => onPageChange?.(p)}>
                {p}
              </Button>
            );
          })}
          {totalPages > 3 && <span className="px-2">...</span>}
          {totalPages > 3 && (
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange?.(totalPages)}>
              {totalPages}
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortableRow({ id, index, children }: { id: string; index: number; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "bg-muted/60")}
    >
      <TableCell className="w-10 cursor-grab text-muted-foreground active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </TableCell>
      <TableCell className="text-muted-foreground">{index}</TableCell>
      {children}
    </TableRow>
  );
}
