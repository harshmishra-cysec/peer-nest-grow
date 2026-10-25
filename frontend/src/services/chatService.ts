import { ApiError, apiGet, apiPost } from "./apiClient";
import type { ChatAttachment, Message } from "@/types";

interface ApiMessage {
  id: number | string;
  subGroupId: number | string;
  senderUserId: number | string;
  senderName: string;
  body: string;
  sentAt: string;
}

function mapMessage(message: ApiMessage): Message {
  return {
    id: String(message.id),
    subGroupId: String(message.subGroupId),
    senderUserId: String(message.senderUserId),
    senderName: message.senderName,
    body: message.body,
    sentAt: message.sentAt,
  };
}

export async function getMessages(subGroupId: string, since?: string | Date): Promise<Message[]> {
  const query = new URLSearchParams();
  if (since) query.set("since", since instanceof Date ? since.toISOString() : since);
  const suffix = query.size ? `?${query.toString()}` : "";
  const messages = await apiGet<ApiMessage[]>(
    `/api/subgroups/${encodeURIComponent(subGroupId)}/messages${suffix}`,
  );
  return messages.map(mapMessage);
}

export function fetchMessages(subGroupId: string): Promise<Message[]> {
  return getMessages(subGroupId);
}

export async function sendMessage(
  subGroupId: string,
  body: string,
  attachments?: ChatAttachment[],
): Promise<Message> {
  if (attachments?.length) {
    throw new ApiError(
      501,
      "Not Implemented",
      "The current backend supports text messages but not chat attachments.",
    );
  }
  const message = await apiPost<ApiMessage>(
    `/api/subgroups/${encodeURIComponent(subGroupId)}/messages`,
    { body },
  );
  return mapMessage(message);
}
