import { API_ORIGIN } from "./apiEndpoints";
import { ADMIN_TOKEN_STORAGE_KEY, AUTH_STORAGE_KEY, useAuthStore } from "@/store/useAuthStore";
import {
  toComplaintMessage,
  type BackendComplaintMessage,
  type ComplaintMessage,
} from "@/services/adapters/complaint.adapter";

const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 15000;

/** Same token resolution the httpClient uses (store first, then localStorage). */
function getToken(): string {
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;
  if (typeof window === "undefined") return "";
  try {
    const manual = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (manual) return manual;
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
      return parsed.state?.token ?? "";
    }
  } catch {
    /* ignore */
  }
  return "";
}

function wsBase(): string {
  return API_ORIGIN.replace(/^http/i, "ws"); // http->ws, https->wss
}

export interface ComplaintChatSocket {
  close: () => void;
}

interface Handlers {
  onMessage: (msg: ComplaintMessage) => void;
  onStatus?: (status: "open" | "closed") => void;
}

/**
 * Realtime connection to a complaint conversation for the admin dashboard.
 * Auto-reconnects with backoff and authenticates via the WebSocket subprotocol
 * (token stays out of the URL). The backend broadcasts every persisted message
 * (incl. the admin's own REST replies), so callers render from `onMessage`.
 */
export function connectComplaintChat(complaintId: string | number, handlers: Handlers): ComplaintChatSocket {
  const url = `${wsBase()}/api/complaints/${complaintId}/chat`;
  let ws: WebSocket | null = null;
  let closed = false;
  let backoff = INITIAL_BACKOFF_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const schedule = () => {
    if (closed || timer) return;
    timer = setTimeout(() => {
      timer = null;
      open();
    }, backoff);
    backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
  };

  const open = () => {
    if (closed || typeof WebSocket === "undefined") return;
    const token = getToken();
    try {
      ws = token ? new WebSocket(url, [token]) : new WebSocket(url);
    } catch {
      schedule();
      return;
    }
    ws.onopen = () => {
      backoff = INITIAL_BACKOFF_MS;
      handlers.onStatus?.("open");
    };
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data));
        if (payload?.type === "message" && payload.data) {
          handlers.onMessage(toComplaintMessage(payload.data as BackendComplaintMessage));
        }
      } catch {
        /* ignore malformed frame */
      }
    };
    ws.onerror = () => {
      /* onclose handles reconnect */
    };
    ws.onclose = () => {
      handlers.onStatus?.("closed");
      if (!closed) schedule();
    };
  };

  open();

  return {
    close: () => {
      closed = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        try {
          ws.close();
        } catch {
          /* ignore */
        }
        ws = null;
      }
    },
  };
}
