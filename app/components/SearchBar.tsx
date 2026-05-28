"use client";

import { useState } from "react";

export default function SearchBar({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-semibold text-slate-700">Search students</label>
      <input
        type="text"
        placeholder="Search by student name..."
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          setValue(val);
          onSearch(val);
        }}
        className="w-full max-w-3xl rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900/40"
      />
    </div>
  );
}