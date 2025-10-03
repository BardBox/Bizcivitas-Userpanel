// Connection Request State Types
export type ConnectionRequestState = "idle" | "sending" | "sent";

// Connection Status Types
export type ConnectionCardStatus = "self" | "connected" | "not_connected";

// Connection User Type
export interface ConnectionUser {
  _id: string;
  fname?: string;
  lname?: string;
  avatar?: string;
  classification?: string;
  companyName?: string;
  profile?: {
    professionalDetails?: {
      companyName?: string;
    };
  };
}

// Connection Type
export interface Connection {
  _id: string;
  sender?: string;
  receiver?: string;
  isAccepted: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

// Connection Card Type
export interface ConnectionCardData {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  isOnline: boolean;
}
