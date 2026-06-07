import { Eye, Pencil, MoreVertical, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ActionMenu({
  onView,
  onEdit,
  onDelete,
  extraItems = [],
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extraItems?: { label: string; icon?: LucideIcon; onClick?: () => void }[];
}) {
  const hasDropdownItems = Boolean(onView || onEdit || onDelete || extraItems.length > 0);

  return (
    <div className="flex items-center gap-1">
      {onView && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView} aria-label="View">
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {hasDropdownItems && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && <DropdownMenuItem onClick={onView}>View</DropdownMenuItem>}
            {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
            {extraItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.label} onClick={item.onClick}>
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {item.label}
                </DropdownMenuItem>
              );
            })}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
