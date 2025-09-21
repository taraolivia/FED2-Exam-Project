"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useUser } from "@/lib/contexts/UserContext";

const INPUT_STYLES = "w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50";
const BUTTON_STYLES = "w-full bg-primary text-accent-darkest py-2 rounded-lg hover:bg-primary/90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed active:scale-[0.98]";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const user = await login({
        email: email as string,
        password: password as string,
      });
      setUser(user);
      router.push("/");
    } catch (err) {
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-background flex items-center justify-center pt-20 md:pt-32">
      <div className="bg-background-lighter rounded-lg p-8 w-full max-w-md">
        <h1 className="font-heading text-2xl text-center mb-6">Log in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email (@stud.noroff.no)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your.name@stud.noroff.no"
              required
              className={INPUT_STYLES}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className={INPUT_STYLES}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={BUTTON_STYLES}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-text/70 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
