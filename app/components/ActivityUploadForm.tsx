"use client";

import { FormEvent, useRef, useState } from "react";
import imageCompression from "browser-image-compression";

export default function ActivityUploadForm({ onDone, classId }: { onDone?: () => void, classId?: string }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const compressFile = async (file: File): Promise<File> => {
    // skip compression for already-small files
    if (file.size < 1_000_000) return file;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      // preserve original name but ensure jpeg extension since HEIC gets converted
      const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
      return new File([compressed], newName, { type: "image/jpeg" });
    } catch (err) {
      console.error("Compression failed, using original file:", err);
      return file;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !date || !files || files.length === 0) {
      setStatus("Provide activity name, date, and at least one image.");
      return;
    }

    setLoading(true);
    setStatus("Compressing images…");

    const form = new FormData();
    form.append("activityName", name);
    form.append("date", date);
    if (classId) form.append("class", classId);

    try {
      const compressedFiles = await Promise.all(
        Array.from(files).map((f) => compressFile(f))
      );
      for (const f of compressedFiles) {
        form.append("images", f);
      }
    } catch (err) {
      setLoading(false);
      setStatus("Failed to process images.");
      return;
    }

    setStatus("Uploading…");

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