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
    <section className="my-6 p-4 border rounded bg-slate-50">
      <h2 className="text-lg font-semibold mb-3">Upload student image</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Student name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Student Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Student ID (optional)</label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="ID if already known"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Class</label>
          <select
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Choose class</option>
            <option value="B8">B8</option>
            <option value="B7">B7</option>
            <option value="B6">B6</option>
            <option value="B5">B5</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {loading ? "Uploading…" : "Upload image"}
        </button>
      </form>
      {status ? <p className="mt-3 text-sm">{status}</p> : null}
    </section>
  );
}
