"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SearchBar from "../../components/SearchBar";
import StudentCard from "../../components/StudentCard";
import ActivityUploadForm from "../../components/ActivityUploadForm";
import { Student } from "@/app/types/student";

export default function ClassPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = useParams();
  const classId = Array.isArray(id) ? id[0] : id ?? "";
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
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
    const loadActivities = async () => {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setActivities(data || []);
    };
    loadActivities();
  }, []);

  useEffect(() => {
    // show activities for this class if any, otherwise fallback to class students
    const classActivities = activities.filter((a:any) => (a.class || "") === classId);
    if (classActivities.length > 0) {
      setResults(classActivities);
      return;
    }

    const classStudents = students.filter((s) => s.class === classId);
    setResults(classStudents);
  }, [students, activities, classId]);

  const handleSearch = (query: string) => {
    if (!query) {
      const classActivities = activities.filter((a:any) => (a.class || "") === classId);
      if (classActivities.length > 0) {
        setResults(classActivities);
        return;
      }

      const classStudents = students.filter((s) => s.class === classId);
      setResults(classStudents);
      return;
    }

    const classActivities = activities.filter((a:any) => (a.class || "") === classId && a.name.toLowerCase().includes(query.toLowerCase()));
    if (classActivities.length > 0) {
      setResults(classActivities);
      return;
    }

    const filtered = students.filter((s) => s.class === classId && s.name.toLowerCase().includes(query.toLowerCase()));
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

      {session?.user.role === "admin" ? <ActivityUploadForm classId={classId} onDone={()=>{fetch('/api/activities').then(r=>r.json()).then(d=>setActivities(d||[]))}} /> : null}

      <section className="space-y-6">
        {results.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {results.map((item) => {
              // if item has images and name -> activity
              if ((item as any).images) {
                return (
                  <article key={`activity-${item.id}`} className="rounded-[1rem] border p-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {(item.images || []).map((img:string, i:number)=> (
                        <img key={i} src={img} alt={`${item.name} ${i+1}`} className="h-36 w-full object-cover rounded-md" />
                      ))}
                    </div>
                  </article>
                );
              }

              return <StudentCard key={(item as Student).id} student={item as Student} />;
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 text-center shadow-xl shadow-slate-200/70">
            <p className="text-sm text-slate-500">No students or activities found for this class yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}
