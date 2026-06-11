import { createRouter } from "@tanstack/react-router";
import { createAppQueryClient } from "@/lib/queryClient";
import { BrandLoader } from "@/components/common/BrandLoader";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = createAppQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: BrandLoader,
    defaultPendingMs: 0,
  });
  return router;
};
