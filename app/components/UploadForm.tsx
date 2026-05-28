"use client";

import { FormEvent, useRef, useState } from "react";

export default function UploadForm({ classId }: { classId: string }) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentClass, setStudentClass] = useState(classId || "");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !studentClass || !image) {
      setStatus("Please enter a student name, select a class, and choose an image.");
      return;
    }

    setLoading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("class", studentClass);
    formData.append("image", image);
    if (studentId) {
      formData.append("id", studentId);
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(result.error || "Upload failed. Try again.");
      return;
    }

    setStatus(`Upload successful. Image saved for ${result.student.name} in ${result.student.class}.`);
    setName("");
    setStudentId("");
    setStudentClass(classId || "");
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-slate-950/60">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Upload</p>
        <h2 className="text-2xl font-semibold text-slate-900">Add or update a student photo</h2>
        <p className="text-sm text-slate-500">Upload a new image for a student and keep class galleries up to date.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-700">Student name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900/40"
            placeholder="Student Name"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Student ID (optional)</label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900/40"
            placeholder="ID if already known"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Class</label>
          <select
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900/40"
          >
            <option value="">Choose class</option>
            <option value="B8">B8</option>
            <option value="B7">B7</option>
            <option value="B6">B6</option>
            <option value="B5">B5</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Uploading…" : "Upload image"}
        </button>
      </form>

      {status ? <p className="status-message">{status}</p> : null}
    </section>
  );
}
