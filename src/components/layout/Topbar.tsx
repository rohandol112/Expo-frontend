import { Bell, Search, ChevronDown, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes.constants";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <div className="relative min-w-0 flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search news, user, category..."
          className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background"
        />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            12
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 hover:bg-muted">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium">{user?.name ?? "Admin"}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate({ to: ROUTES.LOGIN });
              }}
              className="text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
