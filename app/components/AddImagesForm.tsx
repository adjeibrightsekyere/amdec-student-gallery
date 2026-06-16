"use client";

import { FormEvent, useRef, useState } from "react";
import imageCompression from "browser-image-compression";

export default function AddImagesForm({ activityId, onDone }: { activityId: number; onDone?: () => void }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const compressFile = async (file: File): Promise<File> => {
    if (file.size < 1_000_000) return file;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
      return new File([compressed], newName, { type: "image/jpeg" });
    } catch (err) {
      console.error("Compression failed, using original file:", err);
      return file;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setLoading(true);
    setStatus("Compressing images…");

    const form = new FormData();

    try {
      const compressedFiles = await Promise.all(
        Array.from(files).map((f) => compressFile(f))
      );
      for (const f of compressedFiles) form.append("images", f);
    } catch (err) {
      setLoading(false);
      setStatus("Failed to process images.");
      return;
    }

    setStatus("Uploading…");

    const res = await fetch(`/api/activities/${activityId}/images`, { method: "POST", body: form });

    if (res.ok) {
      setStatus("Images added successfully.");
      if (fileRef.current) fileRef.current.value = "";
      setFiles(null);
      if (onDone) onDone();
    } else {
      let errorMsg = "Upload failed. Please try again.";
      try {
        const json = await res.json();
        errorMsg = json.error || errorMsg;
      } catch {
        // server returned empty or non-JSON response
      }
      setStatus(errorMsg);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm font-medium text-slate-700">Add images</label>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
          className="mt-2 w-full rounded-3xl border px-4 py-3"
        />
      </div>

      <button
        disabled={loading}
        className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Uploading…" : "Add images"}
      </button>

      {status && (
        <p className={`mt-2 text-sm ${status.includes("success") ? "text-green-600" : "text-red-500"}`}>
          {status}
        </p>
      )}
    </form>
  );
}