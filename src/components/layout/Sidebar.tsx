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
  FileText,
  MessageSquareText,
  Shield,
  Settings,
  ChevronDown,
  Globe,
  Trophy,
  Megaphone,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useCompetitionBanners } from "@/hooks/api/useCompetition";
import { ROUTES } from "@/constants/routes.constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Item = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  to?: string;
  badge?: string;
  badgeKey?: "ai_queue" | "manual_queue";
  children?: Item[];
};

const MENU: Item[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  {
    label: "News Management",
    icon: Newspaper,
    children: [
      { label: "User News", to: ROUTES.NEWS_ALL },
      { label: "Admin News", to: ROUTES.NEWS_ADMIN },
      { label: "Add News", to: ROUTES.NEWS_ADD },
    ],
  },
  { label: "Categories", icon: FolderTree, to: ROUTES.CATEGORIES },
  { label: "News Tags", icon: Hash, to: ROUTES.NEWS_TAGS },
  { label: "Complaints", icon: MessageSquareWarning, to: ROUTES.COMPLAINTS },
  { label: "Users", icon: Users, to: ROUTES.USERS },
  {
    label: "Competition",
    icon: Trophy,
    children: [
      { label: "Overview", to: ROUTES.COMPETITION },
      { label: "Leaderboard", to: ROUTES.COMPETITION_LEADERBOARD },
      { label: "Participants", to: ROUTES.COMPETITION_PARTICIPANTS },
      { label: "Banner Review", to: ROUTES.COMPETITION_BANNER_REVIEW },
      { label: "AI Review Queue", to: `${ROUTES.COMPETITION_BANNER_REVIEW}?tab=ai-queue`, badgeKey: "ai_queue" },
      { label: "Manual Review Queue", to: `${ROUTES.COMPETITION_BANNER_REVIEW}?tab=manual-queue`, badgeKey: "manual_queue" },
      { label: "Reviewed Banners", to: `${ROUTES.COMPETITION_BANNER_REVIEW}?tab=reviewed` },
      { label: "Reports", to: ROUTES.COMPETITION_REPORTS },
      { label: "Competition Rules", to: ROUTES.COMPETITION_RULES },
      { label: "AI Calling Campaign", to: ROUTES.COMPETITION_AI_CALLING },
      { label: "Settings", to: ROUTES.COMPETITION_SETTINGS },
    ],
  },
  {
    label: "Advertisement",
    icon: Megaphone,
    children: [
      { label: "Banner List", to: ROUTES.ADS_BANNERS },
      { label: "Add New Banner", to: ROUTES.ADS_BANNERS_ADD },
    ],
  },
  { label: "Channels", icon: Tv, to: ROUTES.CHANNELS },
  { label: "Reports", icon: BarChart3, to: ROUTES.REPORTS },
  { label: "Notifications", icon: Bell, to: ROUTES.NOTIFICATIONS },
  { label: "Referrals & Points", icon: Gift, to: ROUTES.REFERRALS },
  { label: "Offers", icon: Tags, to: ROUTES.OFFERS },
  { label: "Listings", icon: List, to: ROUTES.LISTINGS },
  { label: "Monetization Management", icon: DollarSign, to: ROUTES.MONETIZATION },
  { label: "Feedback", icon: MessageSquareText, to: ROUTES.FEEDBACK },
  { label: "CMS", icon: FileText, to: ROUTES.CMS },
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
      { label: "Translation Management", to: ROUTES.SYS_TRANSLATIONS },
    ],
  },
  { label: "Settings", icon: Settings, to: ROUTES.SETTINGS },
];

export function Sidebar() {
  const { pathname, search } = useLocation();
  const user = useAuthStore((s) => s.user);
  const searchStr = typeof search === "string" ? search : JSON.stringify(search);

  // Live queue counts for the Competition badges; one tiny cached query.
  const badgeQuery = useCompetitionBanners({ page: 1, per_page: 1 });
  const badgeCounts = badgeQuery.data?.counts;
  const badgeFor = (key?: Item["badgeKey"]): string | undefined => {
    if (!key || !badgeCounts) return undefined;
    const n = key === "ai_queue" ? badgeCounts.ai_uncertain : badgeCounts.in_review;
    return n > 0 ? String(n) : undefined;
  };

  const [open, setOpen] = useState<Record<string, boolean>>({
    "News Management": pathname.startsWith("/news"),
    "System Management": pathname.startsWith("/system"),
    Competition: pathname.startsWith("/competition"),
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar text-sidebar-foreground max-lg:w-20">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
          <Globe className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold max-lg:hidden">Pehli Baat Admin</span>
      </div>

      <div className="px-5 pt-4 pb-2 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 max-lg:px-3 max-lg:text-center">
        MAIN
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {MENU.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const isOpen = open[item.label] ?? (item.label === "Competition" && pathname.startsWith("/competition"));
            const isActive = item.children.some((c) => c.to && pathname === c.to.split("?")[0]);

            return (
              <div key={item.label} className="mb-1">
                <button
                  onClick={() => setOpen((s) => ({ ...s, [item.label]: !isOpen }))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors max-lg:justify-center",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-white/5 text-sidebar-foreground/85"
                  )}
                >
                  <span className="flex items-center gap-3">
                    {Icon && <Icon className="h-[18px] w-[18px]" />}
                    <span className="max-lg:hidden">{item.label}</span>
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform max-lg:hidden", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div className="mt-1 ml-3 border-l border-sidebar-border/60 pl-3 max-lg:hidden space-y-0.5">
                    {item.children.map((c) => {
                      const targetPath = c.to?.split("?")[0];
                      const targetQuery = c.to?.includes("?") ? c.to.split("?")[1] : undefined;
                      const active = targetQuery
                        ? pathname === targetPath && searchStr.includes(targetQuery)
                        : pathname === targetPath && !searchStr.includes("tab=");

                      return (
                        <Link
                          key={c.label}
                          to={c.to!}
                          className={cn(
                            "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary/15 text-primary-foreground border-l-2 -ml-3 pl-3 border-primary font-medium"
                              : "text-sidebar-foreground/70 hover:bg-white/5"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                            {c.label}
                          </span>
                          {(c.badge ?? badgeFor(c.badgeKey)) && (
                            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                              {c.badge ?? badgeFor(c.badgeKey)}
                            </span>
                          )}
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
                "mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors max-lg:justify-center",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/85 hover:bg-white/5"
              )}
            >
              {Icon && <Icon className="h-[18px] w-[18px]" />}
              <span className="max-lg:hidden">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 max-lg:p-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatarUrl || ""} />
            <AvatarFallback>{user?.name?.[0] || "A"}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden max-lg:hidden">
            <p className="truncate text-sm font-medium">{user?.name || "Admin User"}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
