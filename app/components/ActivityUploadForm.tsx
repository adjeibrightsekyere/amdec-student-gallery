"use client";

import { FormEvent, useRef, useState } from "react";

export default function ActivityUploadForm({ onDone, classId }: { onDone?: () => void, classId?: string }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !date || !files || files.length === 0) {
      setStatus("Provide activity name, date, and at least one image.");
      return;
    }

    setLoading(true);
    setStatus("");

    const form = new FormData();
    form.append("activityName", name);
    form.append("date", date);
    if (classId) form.append("class", classId);
    for (const f of Array.from(files)) {
      form.append("images", f);
    }

    const res = await fetch("/api/activities", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setStatus(json.error || "Upload failed");
      return;
    }

    setStatus("Activity created successfully.");
    setName("");
    setDate("");
    setFiles(null);
    if (fileRef.current) fileRef.current.value = "";
    if (onDone) onDone();
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-950/90">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Activity</p>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Create activity & upload images</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Activity name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quiz 2026" className="mt-2 w-full rounded-3xl border px-4 py-3" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-3xl border px-4 py-3" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Images</label>
          <input ref={fileRef} type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} className="mt-2 w-full rounded-3xl border px-4 py-3" />
        </div>

        <button disabled={loading} className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white">
          {loading ? "Uploading…" : "Create activity"}
        </button>
      </form>

      {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
    </section>
  );
}
