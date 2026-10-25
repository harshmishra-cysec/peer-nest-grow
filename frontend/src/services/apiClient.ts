import type { ApiErrorBody } from "@/types";

export const TOKEN_STORAGE_KEY = "skillnest_token";
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "http://localhost:8080";

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;

  constructor(status: number, error: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
  }
}

function storedToken(): string | null {
  return typeof localStorage === "undefined" ? null : localStorage.getItem(TOKEN_STORAGE_KEY);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = storedToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, { ...init, headers });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Could not reach the SkillNest API";
    throw new ApiError(0, "Network Error", message);
  }

  if (response.status === 401) {
    if (typeof localStorage !== "undefined") localStorage.removeItem(TOKEN_STORAGE_KEY);
    if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
      window.location.assign("/auth");
    }
  }

  if (!response.ok) {
    let payload: Partial<ApiErrorBody> = {};
    try {
      payload = (await response.json()) as Partial<ApiErrorBody>;
    } catch {
      // Fall back to the HTTP status text when the response is not JSON.
    }
    throw new ApiError(
      response.status,
      payload.error || response.statusText || "Request Error",
      payload.message || response.statusText || `Request failed (${response.status})`,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}
