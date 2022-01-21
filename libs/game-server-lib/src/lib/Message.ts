export interface Message {
  handler: string;
  method: string;
  payload: Record<string, unknown>;
}

export interface ResponseMessage {
  [key: string]: unknown;
}
