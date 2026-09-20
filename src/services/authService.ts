import { simulateRequest } from "./apiClient";
import { CURRENT_USER } from "./mockData";
import type { User } from "@/types";

export interface Credentials {
  email: string;
  password: string;
  name?: string;
}

/** Real token handling will live here; for now every login "succeeds". */
export function login(_credentials: Credentials): Promise<User> {
  return simulateRequest(CURRENT_USER);
}

export function signup(credentials: Credentials): Promise<User> {
  return simulateRequest({ ...CURRENT_USER, name: credentials.name ?? CURRENT_USER.name });
}
