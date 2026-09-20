import { MOCK_LATENCY_MS } from "@/constants";

/**
 * Placeholder for the HTTP client that will talk to the Spring Boot API.
 *
 * Today every service resolves mock data through `simulateRequest` so that
 * components already deal with Promises. Swapping to real fetch calls later
 * only touches the /src/services folder.
 */
export function simulateRequest<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), MOCK_LATENCY_MS);
  });
}
