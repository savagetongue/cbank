import type { ApiResponse } from "../../shared/types";
import { useAuthStore } from '@/stores/auth-store';
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    let errorBody;
    try {
      errorBody = await res.json();
    } catch (e) {
      errorBody = { error: `Request failed with status ${res.status}` };
    }
    throw new Error(errorBody.error || 'Request failed');
  }
  // Handle cases with no content
  if (res.status === 204) {
    return null as T;
  }
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || json.data === undefined) {
    throw new Error(json.error || 'API request returned an error');
  }
  return json.data;
}