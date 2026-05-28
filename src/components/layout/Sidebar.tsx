import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Hash,
  MessageSquareWarning,
  Users,
  Tv,
  BarChart3,
  Bell,
  Gift,
  Tags,
  List,
  DollarSign,
  Shield,
  Settings,
  ChevronDown,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes.constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Item = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  to?: string;
  children?: Item[];
};

const MENU: Item[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  {
    label: "News Management",
    icon: Newspaper,
    children: [
      { label: "All News", to: ROUTES.NEWS_ALL },
      { label: "Admin News", to: ROUTES.NEWS_ADMIN },
      { label: "Add News", to: ROUTES.NEWS_ADD },
    ],
  },
  { label: "Categories", icon: FolderTree, to: ROUTES.CATEGORIES },
  { label: "News Tags", icon: Hash, to: ROUTES.NEWS_TAGS },
  { label: "Complaints", icon: MessageSquareWarning, to: ROUTES.COMPLAINTS },
  { label: "Users", icon: Users, to: ROUTES.USERS },
  { label: "Channels", icon: Tv, to: ROUTES.CHANNELS },
  { label: "Reports", icon: BarChart3, to: ROUTES.REPORTS },
  { label: "Notifications", icon: Bell, to: ROUTES.NOTIFICATIONS },
  { label: "Referrals & Points", icon: Gift, to: ROUTES.REFERRALS },
  { label: "Offers", icon: Tags, to: ROUTES.OFFERS },
  { label: "Listings", icon: List, to: ROUTES.LISTINGS },
  { label: "Monetization Management", icon: DollarSign, to: ROUTES.MONETIZATION },
  {
    label: "System Management",
    icon: Shield,
    children: [
      { label: "Language Management", to: ROUTES.SYS_LANGUAGE },
      { label: "Location Management", to: ROUTES.SYS_LOCATION },
      { label: "States", to: ROUTES.SYS_STATES },
      { label: "Districts", to: ROUTES.SYS_DISTRICTS },
      { label: "Areas", to: ROUTES.SYS_AREAS },
      { label: "Audit Logs", to: ROUTES.SYS_AUDIT },
      { label: "Backup & Restore", to: ROUTES.SYS_BACKUP },
      { label: "Role & Permission", to: ROUTES.SYS_ROLES },
    ],
  },
  { label: "Settings", icon: Settings, to: ROUTES.SETTINGS },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState<Record<string, boolean>>({
    "News Management": pathname.startsWith("/news"),
    "System Management": pathname.startsWith("/system"),
  });

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
          <Globe className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">News Admin</span>
      </div>

      <div className="px-5 pt-4 pb-2 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50">
        MAIN
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {MENU.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const isOpen = open[item.label];
            const isActive = item.children.some((c) => pathname === c.to);
            return (
              <div key={item.label} className="mb-1">
                <button
                  onClick={() => setOpen((s) => ({ ...s, [item.label]: !s[item.label] }))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5 text-sidebar-foreground/85",
                  )}
                >
                  <span className="flex items-center gap-3">
                    {Icon && <Icon className="h-[18px] w-[18px]" />}
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div className="mt-1 ml-3 border-l border-sidebar-border/60 pl-3">
                    {item.children.map((c) => {
                      const active = pathname === c.to;
                      return (
                        <Link
                          key={c.label}
                          to={c.to!}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary/15 text-primary-foreground border-l-2 -ml-3 pl-3 border-primary"
                              : "text-sidebar-foreground/70 hover:bg-white/5",
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          const active = pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to!}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/85 hover:bg-white/5",
              )}
            >
              {Icon && <Icon className="h-[18px] w-[18px]" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "Admin User"}</p>
            <p className="text-xs text-emerald-400">● Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
