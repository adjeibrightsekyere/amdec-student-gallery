"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function VisitorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "visitor") {
      if (!session) {
        router.replace("/");
      } else if (session.user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
      return;
    }

    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching classes:", err);
        setLoading(false);
      });
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
        <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl shadow-slate-200/80">
          <p className="text-center text-sm text-slate-500">Loading visitor dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-10 px-4 py-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-slate-950/60">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-600">Visitor dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">Explore student galleries</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Browse classes, search students, and view images.</p>
          </div>

          <button
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/");
            }}
            className="inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-slate-950/60">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Classes</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Choose a class</h2>
          </div>
          <p className="text-sm text-slate-500">View student photos and class details.</p>
        </div>

        <div className="class-grid">
          {classes.map((className) => (
            <Link
              key={className}
              href={`/class/${className}`}
              className="class-card"
            >
              <h2 className="text-2xl font-semibold text-slate-900">{className}</h2>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
