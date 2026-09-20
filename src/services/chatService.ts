import { simulateRequest } from "./apiClient";
import { CURRENT_USER, MESSAGES } from "./mockData";
import type { ChatAttachment, Message } from "@/types";

/**
 * Chat is isolated from the rest of the sub-group service because it will
 * move to a WebSocket/STOMP connection when the Spring Boot backend lands.
 * Components only ever call these functions.
 */

export function fetchMessages(subGroupId: string): Promise<Message[]> {
  return simulateRequest(MESSAGES.filter((message) => message.subGroupId === subGroupId));
}

/** Returns the message as the server would echo it back (with id + timestamp + optional attachments). */
export function sendMessage(
  subGroupId: string,
  body: string,
  attachments?: ChatAttachment[],
): Promise<Message> {
  const message: Message = {
    id: `m-${Date.now()}`,
    subGroupId,
    senderUserId: CURRENT_USER.id,
    senderName: CURRENT_USER.name,
    body,
    sentAt: new Date().toISOString(),
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  };
  MESSAGES.push(message);
  return simulateRequest(message);
}
