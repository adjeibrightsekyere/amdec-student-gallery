"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ActivityUploadForm from "@/app/components/ActivityUploadForm";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      router.replace("/");
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

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") return;

    fetch("/api/activities")
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => setActivities(data || []))
      .catch((err) => {
        console.error("Error fetching activities:", err);
        setActivities([]);
      });
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
        <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl shadow-slate-200/80">
          <p className="text-center text-sm text-slate-500">Loading admin dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-10 px-4 py-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-slate-950/60">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-600">Admin dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">Manage classes and uploads</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Use your admin access to review classes, upload student photos, and track gallery content.</p>
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
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Activities</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Manage activities & uploads</h2>
          <p className="text-sm text-slate-500">Create activities (e.g. Quiz 2026), upload multiple images, and remove images.</p>
        </div>

        <div className="mb-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => (
              <Link key={a.id} href={`/activities/${a.id}`} className="block rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-slate-950/60 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{a.name}</h3>
                <p className="text-sm text-slate-500">{new Date(a.date).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ActivityUploadForm onDone={() => {
            fetch('/api/activities').then(r=>r.json()).then(d=>setActivities(d || []));
          }} />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">Search activities</label>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by activity name..." className="w-full rounded-3xl border px-4 py-3" />

            <div className="mt-4 space-y-4">
              {activities.filter(a=> a.name.toLowerCase().includes(search.toLowerCase())).map((activity)=> (
                <article key={activity.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100"><Link href={`/activities/${activity.id}`}>{activity.name}</Link></h3>
                      <p className="text-sm text-slate-500">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {activity.images?.map((img:string, i:number)=> (
                      <div key={i} className="relative">
                        <img src={img} alt={`${activity.name} ${i+1}`} className="h-36 w-full object-cover rounded-md" />
                        <button onClick={async ()=>{
                          const res = await fetch('/api/activities/deleteImage', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ activityId: activity.id, imageUrl: img })});
                          if (res.ok) {
                            setActivities((prev)=> prev.map(a=> a.id===activity.id ? {...a, images: a.images.filter((x:string)=> x!==img)} : a));
                          }
                        }} className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white">Delete</button>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
