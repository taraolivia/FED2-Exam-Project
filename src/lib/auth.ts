const API_BASE = "https://v2.api.noroff.dev";

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  venueManager?: boolean;
};

export type User = {
  name: string;
  email: string;
  accessToken: string;
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

export async function login(data: LoginData): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Login failed";
      try {
        const error = await res.json();
        const apiError = error.errors?.[0]?.message || "Login failed";

        if (apiError.includes("Invalid email or password")) {
          errorMessage =
            "Invalid email or password. Make sure you're using your @stud.noroff.no email and correct password.";
        } else {
          errorMessage = apiError;
        }
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
      avatar: result.data.avatar,
      banner: result.data.banner,
      venueManager: result.data.venueManager,
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

export async function register(data: RegisterData): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Registration failed";
      try {
        const error = await res.json();
        console.error("Registration error:", error);
        const apiError =
          error.errors?.[0]?.message || error.message || "Registration failed";

        if (apiError.includes("Profile already exists")) {
          errorMessage =
            "This username or email is already taken. Please try a different one.";
        } else {
          errorMessage = apiError;
        }
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

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

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
