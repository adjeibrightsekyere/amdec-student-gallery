"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, signOut } from "@/app/lib/auth";

export default function VisitorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/");
      return;
    }

    if (user.role !== "visitor") {
      router.replace(user.role === "admin" ? "/admin" : "/");
      return;
    }

    fetch("/api/classes")
  .then((res) => res.json())
  .then((data) => {
    setClasses(data);
    setLoading(false);
  });
  }, [router]);

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Visitor Dashboard</h1>
          <p className="text-slate-600">Search and view student classes.</p>
        </div>
        <button
          onClick={() => {
            signOut();
            router.replace("/");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Sign out
        </button>
      </div>

      <div className="class-grid">
       {classes.map((className) => (
  <Link
    key={className}
    href={`/class/${className}`}
    className="class-card"
  >
    <h2>{className}</h2>
  </Link>
))}
      </div>
    </main>
  );
}
