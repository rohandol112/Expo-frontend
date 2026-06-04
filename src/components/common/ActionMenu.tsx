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
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onView}>View</DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          {extraItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.label} onClick={item.onClick}>
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {item.label}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
