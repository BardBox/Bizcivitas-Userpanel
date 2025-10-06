// Connection Type Definitions
// Centralized type definitions for Connection-related data structures

import { User } from "./user.types";

/**
 * Connection status between users
 */
export type ConnectionStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected";

/**
 * Connection user information (minimal)
 */
export interface ConnectionUser {
  _id: string;
  name: string;
  avatar?: string;
}

/**
 * Basic Connection interface
 */
export interface Connection {
  _id: string;
  sender: string | User;
  receiver: string | User;
  isAccepted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Populated Connection (with user details)
 */
export interface PopulatedConnection {
  _id: string;
  sender: User;
  receiver: User;
  isAccepted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Connection with user info (from API)
 */
export interface ConnectionWithUser {
  _id: string;
  user?: ConnectionUser;
  sender?: string;
  receiver?: string;
  isAccepted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Connection status information
 */
export interface ConnectionStatusInfo {
  status: ConnectionStatus;
  connectionId: string | null;
}

/**
 * Connection request (for API calls)
 */
export interface ConnectionRequest {
  receiverId: string;
}

/**
 * Accept/Delete connection request payload
 */
export interface ConnectionActionPayload {
  connectionId: string;
}

/**
 * Connection card props state
 */
export type ConnectionRequestState = "idle" | "sending" | "sent";

/**
 * Connection card status
 */
export type ConnectionCardStatus = "self" | "connected" | "not_connected";

/**
 * API Response types for connections
 */
export interface ConnectionApiResponse {
  statusCode: number;
  data: {
    connection: Connection;
  };
  message: string;
  success: boolean;
}

export interface ConnectionsApiResponse {
  statusCode: number;
  data: {
    connections: User[];
  };
  message: string;
  success: boolean;
}

export interface ConnectionRequestsApiResponse {
  statusCode: number;
  data: {
    connections: Array<{
      connectionId: string;
      type: "sent" | "received";
      sender: {
        id: string | null;
        fname: string | null;
        lname: string | null;
        email: string | null;
        avatar: string | null;
        profile: any | null;
      };
      receiver: {
        id: string | null;
        fname: string | null;
        lname: string | null;
        email: string | null;
        avatar: string | null;
        profile: any | null;
      };
    }>;
  };
  message: string;
  success: boolean;
}

/**
 * Suggestions API Response
 */
export interface SuggestionsApiResponse {
  statusCode: number;
  data: {
    suggestions: User[];
    totalSuggestions?: number;
    message?: string;
  };
  message: string;
  success: boolean;
}

/**
 * Individual connection request item
 * Extracted from ConnectionRequestsApiResponse for component usage
 * Represents a single sent or received connection request
 *
 * @example
 * const request: ConnectionRequestItem = {
 *   connectionId: "123",
 *   type: "received",
 *   sender: { id: "456", fname: "John", ... },
 *   receiver: { id: "789", fname: "Jane", ... }
 * };
 */
export type ConnectionRequestItem =
  ConnectionRequestsApiResponse["data"]["connections"][number];

/**
 * User information in a connection request
 * Extracted from ConnectionRequestItem sender/receiver
 * Contains basic user details for displaying in request cards
 *
 * Note: Both sender and receiver share this same type structure
 */
export type ConnectionRequestUser = ConnectionRequestItem["sender"];
