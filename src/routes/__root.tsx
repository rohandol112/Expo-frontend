import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { GlobalPageSkeleton } from "@/components/common/GlobalPageSkeleton";

import appCss from "../styles.css?url";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);

  return (
    <div
      onClick={() => reset()}
      role="presentation"
    >
      <GlobalPageSkeleton />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pehli Baat" },
      { name: "description", content: "A static admin panel frontend for managing news content, users, and system settings." },
      { name: "author", content: "Pehli Baat" },
      { property: "og:title", content: "Pehli Baat" },
      { property: "og:description", content: "A static admin panel frontend for managing news content, users, and system settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Pehli Baat" },
      { name: "twitter:description", content: "A static admin panel frontend for managing news content, users, and system settings." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f6f7326c-69d6-49d3-a642-cfe96314bb24/id-preview-7557f6fb--19d3c5b4-1c54-43c9-9128-5517099f75ce.lovable.app-1779974429369.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f6f7326c-69d6-49d3-a642-cfe96314bb24/id-preview-7557f6fb--19d3c5b4-1c54-43c9-9128-5517099f75ce.lovable.app-1779974429369.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: GlobalPageSkeleton,
  notFoundComponent: GlobalPageSkeleton,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
