"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import { useUser } from "@/lib/contexts/UserContext";

const REDIRECT_DELAY = 2000;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { user } = useUser();
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
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!name || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    // Validate email domain
    if (!email.toString().endsWith('@stud.noroff.no')) {
      setError("Email must be a @stud.noroff.no address");
      setLoading(false);
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(name.toString())) {
      setError("Username can only contain letters, numbers, and underscores");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.toString().length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    const venueManager = formData.get("venueManager") === "on";

    try {
      await register({ name: name as string, email: email as string, password: password as string, venueManager });
      setSuccess(true);
      setTimeout(() => router.push("/login"), REDIRECT_DELAY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-background flex items-center justify-center pt-20">
      <div className="bg-background-lighter rounded-lg p-8 w-full max-w-md">
        <h1 className="font-heading text-2xl text-center mb-6">Sign up</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Registration successful! Redirecting to login...
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Username (letters, numbers, underscore only)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              pattern="[a-zA-Z0-9_]+"
              placeholder="my_username"
              required
              className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email (must be @stud.noroff.no)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              pattern=".*@stud\.noroff\.no$"
              placeholder="your.name@stud.noroff.no"
              required
              className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password (minimum 8 characters)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              minLength={8}
              required
              className="w-full px-3 py-2 border border-text/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="venueManager"
              name="venueManager"
              className="mr-2"
            />
            <label htmlFor="venueManager" className="text-sm">
              I want to be a venue manager
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary text-accent-darkest py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        
        <p className="text-center text-sm text-text/70 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}