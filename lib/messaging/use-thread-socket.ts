"use client";

import { useEffect } from "react";
import { hmoApi } from "@/lib/api/hmo-api";
import { T } from "@/lib/api/cache-tags";
import { createMessagingSocket } from "@/lib/messaging/messaging-socket";
import { useAppDispatch } from "@/lib/hooks";

export function useThreadSocket(
  conversationId: string | null,
  accessToken: string | null,
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!conversationId || !accessToken) return;
    const socket = createMessagingSocket(accessToken);
    socket.on("connect", () => {
      socket.emit("joinThread", { conversationId });
    });
    socket.on("newMessage", () => {
      dispatch(
        hmoApi.util.invalidateTags([
          { type: T.HmoMessage, id: `THREAD-CV-${conversationId}` },
        ]),
      );
    });
    return () => {
      socket.removeAllListeners();
      socket.close();
    };
  }, [conversationId, accessToken, dispatch]);
}
