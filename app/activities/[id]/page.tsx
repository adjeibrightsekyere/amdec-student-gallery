"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AddImagesForm from "@/app/components/AddImagesForm";

export default function ActivityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = useParams();
  const activityId = Number(Array.isArray(id) ? id[0] : id ?? "");
  const [activity, setActivity] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/activities');
      if (!res.ok) {
        console.error('Failed to load activities', res.status);
        setActivity(null);
        return;
      }
      const list = await res.json();
      const found = (list || []).find((a:any)=> a.id === activityId);
      setActivity(found || null);
    };
    load();
  }, [activityId]);

  if (status === "loading") return null;

  return (
    <main className="px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {activity ? (
          <section className="rounded-[2rem] border bg-white p-6">
            <h1 className="text-2xl font-semibold text-white dark:text-slate-900">{activity.name}</h1>
            <p className="text-sm text-slate-500">{new Date(activity.date).toLocaleDateString()}</p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {(activity.images || []).map((img:string, i:number)=> (
                <img key={i} src={img} alt={`${activity.name} ${i+1}`} className="h-48 w-full object-cover rounded-md" />
              ))}
            </div>

            {session?.user.role === 'admin' ? (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Add more images</h3>
                <AddImagesForm activityId={activityId} onDone={async ()=>{
                  const res = await fetch('/api/activities');
                  const list = await res.json();
                  const found = (list || []).find((a:any)=> a.id === activityId);
                  setActivity(found || null);
                }} />
              </div>
            ) : null}
          </section>
        ) : (
          <div className="rounded-[2rem] border bg-white p-6 text-center">
            <p className="text-sm text-slate-500">Activity not found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
