"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, loginUser, registerUser, UserRole } from "@/app/lib/auth";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("visitor");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.replace(user.role === "admin" ? "/admin" : "/visitor");
    }
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const action = mode === "signin" ? loginUser(username, password) : registerUser(username, password, role);
    if (!action.success) {
      setMessage(action.error || "Something went wrong.");
      return;
    }

    router.replace(action.user?.role === "admin" ? "/admin" : "/visitor");
  };

  return (
    <main className="p-8 max-w-lg mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Welcome to Student Gallery</h1>
        <p className="mt-2 text-slate-600">Sign in or create an account to continue.</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded ${mode === "signin" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
          onClick={() => setMode("signin")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === "signup" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
          onClick={() => setMode("signup")}
          type="button"
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-sm">
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter password"
          />
        </div>

        {mode === "signup" ? (
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border rounded p-2"
            >
              <option value="visitor">Visitor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ) : null}

        <button type="submit" className="w-full bg-blue-600 text-white rounded px-4 py-2">
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      {message ? <p className="mt-4 text-red-600">{message}</p> : null}
    </main>
  );
}
