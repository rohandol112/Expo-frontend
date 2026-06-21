import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectComplaintChat } from "@/lib/complaintChatSocket";
import { complaintKeys } from "./useComplaints";
import type { ComplaintMessage } from "@/services/adapters/complaint.adapter";

/**
 * Opens a realtime connection for a complaint's conversation and merges incoming
 * messages into the existing `complaintKeys.messages(id)` query cache, so the
 * Conversation UI updates live when the citizen (or another admin) sends a
 * message. Returns whether the socket is currently connected.
 */
export function useComplaintChatSocket(id: string) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!id) return;
    const socket = connectComplaintChat(id, {
      onStatus: (status) => setConnected(status === "open"),
      onMessage: (msg) => {
        queryClient.setQueryData<ComplaintMessage[]>(complaintKeys.messages(id), (prev) => {
          const list = prev ?? [];
          // Dedupe by id — the server echoes the sender's own message too.
          if (list.some((m) => m.id === msg.id)) return list;
          return [...list, msg];
        });
      },
    });
    return () => {
      socket.close();
      setConnected(false);
    };
  }, [id, queryClient]);

  return { connected };
}
