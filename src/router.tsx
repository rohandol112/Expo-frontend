import { createRouter } from "@tanstack/react-router";
import { createAppQueryClient } from "@/lib/queryClient";
import { GlobalPageSkeleton } from "@/components/common/GlobalPageSkeleton";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = createAppQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: GlobalPageSkeleton,
    defaultPendingMs: 0,
  });
  return router;
};
