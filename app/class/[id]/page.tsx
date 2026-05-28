"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SearchBar from "../../components/SearchBar";
import StudentCard from "../../components/StudentCard";
import UploadForm from "../../components/UploadForm";
import { Student } from "@/app/types/student";

export default function ClassPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = useParams();
  const classId = Array.isArray(id) ? id[0] : id ?? "";
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/");
      return;
    }

    setLoading(false);
  }, [status, session, router]);

  useEffect(() => {
    const loadStudents = async () => {
      const response = await fetch("/api/students");
      const data = (await response.json()) as Student[];
      setStudents(data);
    };
    loadStudents();
  }, []);

  useEffect(() => {
    const classStudents = students.filter((s) => s.class === classId);
    setResults(classStudents);
  }, [students, classId]);

  const handleSearch = (query: string) => {
    const classStudents = students.filter((s) => s.class === classId);
    if (!query) {
      setResults(classStudents);
      return;
    }

    const filtered = classStudents.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
        <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl shadow-slate-200/80">
          <p className="text-center text-sm text-slate-500">Loading class data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8 px-4 py-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-slate-950/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-600">Class {classId}</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">Student gallery</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              {session?.user.role === "admin"
                ? "Admin can upload images and search students."
                : "Search and view students in this class."}
            </p>
          </div>

          <div className="max-w-xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {session?.user.role === "admin" ? <UploadForm classId={classId} /> : null}

      <section className="space-y-6">
        {results.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {results.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 text-center shadow-xl shadow-slate-200/70">
            <p className="text-sm text-slate-500">No students found in this class yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}
