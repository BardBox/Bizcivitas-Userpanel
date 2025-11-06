import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (userId: string): Socket => {
  // If socket exists and is connected, just return it
  if (socket?.connected) {
    return socket;
  }

  // If socket exists but disconnected, disconnect and clean up
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Socket.io connects to root server, not /api/v1 endpoint
  const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000")
    .replace("/api/v1", ""); // Remove /api/v1 suffix for socket connection

  try {
    // Match mobile app configuration exactly
    socket = io(BACKEND_URL, {
      path: "/socket.io", // Explicitly set the default path
      transports: ["websocket", "polling"], // Websocket first like mobile app
      autoConnect: false, // Manual connection like mobile app
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      upgrade: true, // Allow transport upgrades
      rememberUpgrade: true, // Remember successful transport upgrade
      forceNew: false, // Reuse existing connection if available
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
      // Emit setup event with user ID (authentication)
      socket?.emit("setup", userId);
    });

    socket.on("connected", () => {
      console.log("✅ Socket setup complete for user:", userId);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error.message);
    });

    // Manually connect like mobile app
    socket.connect();

    return socket;
  } catch (error) {
    console.error("Failed to initialize socket:", error);
    throw error;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected manually");
  }
};

// Socket event types for type safety
export type SocketEventsMap = {
  // Client → Server (emit)
  setup: [userId: string];
  "join chat": [chatId: string];
  typing: [chatId: string];
  "stop typing": [chatId: string];
  "new message": [message: any];

  // Server → Client (on/listen)
  connected: [];
  "message received": [message: any];
  "message deleted": [data: { messageId: string; chatId: string }];
};
