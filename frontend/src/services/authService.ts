import { apiGet, apiPost, TOKEN_STORAGE_KEY } from "./apiClient";
import type { AuthResponse, User } from "@/types";

export interface Credentials {
  email: string;
  password: string;
  name?: string;
}

function toUser(response: AuthResponse): User {
  return {
    id: String(response.userId),
    name: response.name,
    email: response.email,
    bio: "",
    skillBaseline: "Beginner",
    currentStreakDays: 0,
    isRestrictedFromJoining: false,
  };
}

function saveToken(response: AuthResponse): User {
  localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
  return toUser(response);
}

export async function login(credentials: Credentials): Promise<User> {
  const response = await apiPost<AuthResponse>("/api/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });
  return saveToken(response);
}

export async function register(credentials: Credentials): Promise<User> {
  const response = await apiPost<AuthResponse>("/api/auth/register", {
    name: credentials.name ?? "",
    email: credentials.email,
    password: credentials.password,
  });
  return saveToken(response);
}

/** Kept as the existing form-facing name. */
export const signup = register;

export async function getCurrentUser(): Promise<User> {
  return toUser(await apiGet<AuthResponse>("/api/users/me"));
}

export function logout(): Promise<void> {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  return Promise.resolve();
}
