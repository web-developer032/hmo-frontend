"use client";

import { io, type Socket } from "socket.io-client";
import { getSocketBaseUrl } from "@/lib/api/base-url";

export function createMessagingSocket(accessToken: string): Socket {
  const url = getSocketBaseUrl();
  return io(`${url}/messages`, {
    auth: { token: accessToken },
    autoConnect: true,
    transports: ["websocket", "polling"],
  });
}
