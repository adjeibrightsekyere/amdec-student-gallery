"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const applyTheme = (nextTheme: "light" | "dark") => {
    if (typeof document !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const preferredDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme === "light" || savedTheme === "dark" ? (savedTheme as "light" | "dark") : (preferredDark ? "dark" : "light");
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed right-4 top-4 z-50 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-xl shadow-slate-400/10 backdrop-blur transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 dark:hover:bg-slate-900"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
