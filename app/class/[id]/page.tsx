"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SearchBar from "../../components/SearchBar";
import StudentCard from "../../components/StudentCard";
import UploadForm from "../../components/UploadForm";
import { Student } from "@/app/types/student";
import { getCurrentUser } from "@/app/lib/auth";

export default function ClassPage() {
  const router = useRouter();
  const { id } = useParams();
  const classId = Array.isArray(id) ? id[0] : id ?? "";
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Student[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUser = getCurrentUser();
    if (!authUser) {
      router.replace("/");
      return;
    }

    setUserRole(authUser.role);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const loadStudents = async () => {
      const response = await fetch("/api/students");
      const data = (await response.json()) as Student[];
      setStudents(data);
    };
    loadStudents();
  }, []);

  useEffect(() => {
    const classStudents = students.filter((s) => s.class === classId);
    setResults(classStudents);
  }, [students, classId]);

  const handleSearch = (query: string) => {
    const classStudents = students.filter((s) => s.class === classId);
    if (!query) {
      setResults(classStudents);
      return;
    }

    const filtered = classStudents.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Class {classId}</h1>
        <p className="text-sm text-slate-600">
          {userRole === "admin" ? "Admin can upload images and search students." : "Search and view students in this class."}
        </p>
      </div>

      {userRole === "admin" ? <UploadForm classId={classId} /> : null}

      <SearchBar onSearch={handleSearch} />

      {results.length > 0 ? (
        results.map((student) => <StudentCard key={student.id} student={student} />)
      ) : (
        <p>No student found</p>
      )}
    </main>
  );
}
