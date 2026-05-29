import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export const Route = createFileRoute("/_app/news-tags")({
  component: () => <PlaceholderPage title="News Tags" description="Tag taxonomy, usage counts, and moderation tools will appear here." />,
});
