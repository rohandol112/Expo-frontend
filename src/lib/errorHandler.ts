import { toast } from "sonner";

export function handleError(err: unknown, fallback = "Something went wrong") {
  const message = err instanceof Error ? err.message : fallback;
  // eslint-disable-next-line no-console
  console.error("[error]", err);
  toast.error(message);
  return message;
}