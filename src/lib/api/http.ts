export type HttpError = {
  status: number;
  message: string;
  issues?: unknown;
};

/**
 * Makes a JSON HTTP request with proper error handling
 * @param input - URL or Request object
 * @param init - Request configuration options
 * @returns Promise resolving to parsed JSON response
 * @throws HttpError with status and message on failure
 */
export async function fetchJSON<T>(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  // 204 No Content: return undefined as T to keep typing happy for deletes, etc.
  if (res.status === 204) return undefined as T;

  let parsed: any = null;
  try {
    parsed = await res.json();
  } catch (error) {
    console.warn("Failed to parse JSON response:", error);
    // Non-JSON response
  }

  if (!res.ok) {
    const message =
      parsed?.errors?.[0]?.message ??
      parsed?.message ??
      res.statusText ??
      "Request failed";
    const err: HttpError = {
      status: res.status,
      message,
      issues: parsed?.errors,
    };
    throw err;
  }

  return parsed as T; // Expecting { data, meta } on v2
}
