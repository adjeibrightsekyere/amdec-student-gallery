"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import type { UserRole } from "@/app/lib/authHelpers";

export default function AuthForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("visitor");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminAvailable, setAdminAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const redirectPath = session.user.role === "admin" ? "/admin" : "/visitor";
      router.replace(redirectPath);
    }
  }, [status, session, router]);

  // Check if admin slots are available
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/adminCount");
        if (!res.ok) return;
        const data = await res.json();
        setAdminAvailable((data.count ?? 0) < 3);
      } catch (err) {
        console.error("Failed to fetch admin count", err);
      }
    };

    checkAdmin();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const result = await signIn("credentials", {
          username,
          password,
          redirect: false,
        });

        if (!result?.ok) {
          setMessage(result?.error || "Invalid username or password.");
          setLoading(false);
          return;
        }

        // Give the session provider time to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect based on stored credentials - we'll verify role server-side in middleware
        router.push("/visitor");
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Registration failed.");
          setLoading(false);
          return;
        }

        const signInResult = await signIn("credentials", {
          username,
          password,
          redirect: false,
        });

        if (!signInResult?.ok) {
          setMessage("Registration successful, but login failed. Please sign in.");
          setLoading(false);
          return;
        }

        router.push(role === "admin" ? "/admin" : "/visitor");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
        <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl shadow-slate-200/80 dark:bg-slate-950/90 dark:shadow-slate-950/60">
          <p className="text-center text-sm text-slate-500 dark:text-slate-300">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-2xl space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white text-slate-900 p-8 shadow-xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:shadow-slate-950/60">
          <div className="mb-8 space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-600">Student Gallery</p>
            <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">Sign in or create an account</h1>
            <p className="max-w-xl mx-auto text-sm text-slate-500 dark:text-slate-400">Access student galleries, upload photos, and manage classes with secure user roles.</p>
          </div>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <button
              className={`rounded-full border px-6 py-3 text-sm font-semibold transition ${mode === "signin" ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"}`}
              onClick={() => setMode("signin")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`rounded-full border px-6 py-3 text-sm font-semibold transition ${mode === "signup" ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"}`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-transparent">
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-900/40"
                placeholder="Enter username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-900/40"
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            {mode === "signup" ? (
              <div>
                <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-3 w-full rounded-3xl border border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900/40"
                  disabled={loading}
                >
                  <option value="visitor">Visitor</option>
                  {adminAvailable ? (
                    <option value="admin">Admin</option>
                  ) : (
                    <option value="visitor" disabled>
                      Admin (full)
                    </option>
                  )}
                </select>
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-3xl bg-sky-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Loading..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {message ? <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}
