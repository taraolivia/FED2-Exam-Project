export type HttpError = {
  status: number;
  message: string;
  issues?: unknown;
};

const ALLOWED_HOSTS = ['v2.api.noroff.dev'];

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
  // Validate URL to prevent SSRF and cache parsed URL
  let validatedInput: string | URL | Request = input;
  let parsedUrl: URL;
  try {
    parsedUrl = typeof input === 'string' ? new URL(input) : input instanceof URL ? input : new URL(input.url);
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      throw new Error('Invalid API endpoint');
    }
    // Use parsed URL to avoid duplicate parsing
    validatedInput = parsedUrl;
  } catch {
    throw new Error('Invalid URL format');
  }

  try {
    const res = await fetch(validatedInput, {
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
      // Non-JSON response - don't log user input
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

    return parsed as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
}
