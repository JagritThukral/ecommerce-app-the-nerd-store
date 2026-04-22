"use client";

import { SubmitEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/src/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode =
    searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result =
        mode === "signup"
          ? await signUp.email({
              name,
              email,
              password,
              callbackURL: "/",
            })
          : await signIn.email({
              email,
              password,
              callbackURL: "/",
            });

      if (result?.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : mode === "signup"
              ? "Failed to create account."
              : "Invalid credentials.";
        throw new Error(message);
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Login failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-primary-content flex items-center justify-center p-6 pt-24">
      <section className="w-full max-w-md rounded-2xl bg-white shadow-sm border border-black/10 p-6 md:p-8">
        <div className="mb-6">
          <div className="inline-flex p-1 rounded-lg bg-black/5 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={
                "px-4 py-2 rounded-md text-sm font-medium " +
                (mode === "login" ? "bg-black text-white" : "text-black")
              }
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={
                "px-4 py-2 rounded-md text-sm font-medium " +
                (mode === "signup" ? "bg-black text-white" : "text-black")
              }
            >
              Sign up
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {mode === "signup" ? "Create account" : "Login"}
          </h1>
          <p className="text-black/60">
            {mode === "signup"
              ? "Join The Nerd Store in seconds."
              : "Welcome back to The Nerd Store."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" ? (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="h-11 px-3 rounded-lg border border-black/20 outline-none focus:border-black"
                placeholder="Your name"
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 px-3 rounded-lg border border-black/20 outline-none focus:border-black"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-11 px-3 rounded-lg border border-black/20 outline-none focus:border-black"
              placeholder="Your password"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-lg bg-black text-white font-medium disabled:opacity-60"
          >
            {loading
              ? mode === "signup"
                ? "Creating account..."
                : "Logging in..."
              : mode === "signup"
                ? "Create account"
                : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
