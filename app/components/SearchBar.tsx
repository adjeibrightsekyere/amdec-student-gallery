"use client";

import { useState } from "react";

export default function SearchBar({ onSearch}: { onSearch: (value: string) => void }) {
    const [value, setValue] = useState("");

    return (
        <input 
        type="text"
        placeholder="Search Student..."
        value={value}
        onChange={(e) => {
            const val = e.target.value;
            setValue(val);
            onSearch(val);
        }}
        className="border p-2 w-full max-w-md rounded"
        />
    )
}