import axios from 'axios';
import { toast } from 'sonner';

export function handleApiError(error: unknown, fallbackMessage = 'Something went wrong'): string {
  let message = fallbackMessage;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    message = data?.message ?? data?.error ?? error.message ?? fallbackMessage;
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast.error(message);
  return message;
}
