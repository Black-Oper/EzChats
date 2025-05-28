// src/types.ts
export interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp?: number;
}