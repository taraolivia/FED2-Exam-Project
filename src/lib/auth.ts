const API_BASE = "https://v2.api.noroff.dev";

export function validateApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured");
  }
  return apiKey;
}

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
  banner?: {
    url: string;
    alt?: string;
  };
  venueManager?: boolean;
};

export type User = {
  name: string;
  email: string;
  accessToken: string;
  bio?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
  banner?: {
    url: string;
    alt?: string;
  };
  venueManager?: boolean;
};

/**
 * Authenticates user with email and password
 * @param data - User login credentials
 * @returns Promise resolving to authenticated user data
 * @throws Error if login fails
 */
export async function login(data: LoginData): Promise<User> {
  const apiKey = validateApiKey();

  try {
    const res = await fetch(`${API_BASE}/auth/login?_holidaze=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Login failed";
      try {
        const error = await res.json();
        errorMessage = error.errors?.[0]?.message || "Login failed";
      } catch {
        // Ignore JSON parsing errors for error response
      }
      throw new Error(errorMessage);
    }

    const result = await res.json();
    const user: User = {
      name: result.data.name,
      email: result.data.email,
      accessToken: result.data.accessToken,
      bio: result.data.bio || undefined,
      avatar: result.data.avatar || undefined,
      banner: result.data.banner || undefined,
      venueManager: result.data.venueManager || false,
    };

    // Store in localStorage (client-side only)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Login failed");
  }
}

/**
 * Registers a new user account
 * @param data - User registration data including name, email, password
 * @throws Error if registration fails
 */
export async function register(data: RegisterData): Promise<void> {
  const apiKey = validateApiKey();

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Registration failed";
      try {
        const error = await res.json();
        errorMessage =
          error.errors?.[0]?.message || error.message || "Registration failed";
      } catch {
        // Ignore JSON parsing errors for error response
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Registration failed");
  }
}

/**
 * Logs out current user by clearing stored data
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

/**
 * Retrieves stored user data from localStorage
 * @returns User object if found, null otherwise
 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
