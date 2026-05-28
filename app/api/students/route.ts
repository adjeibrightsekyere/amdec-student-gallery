import { NextResponse } from "next/server";
import { getStudents } from "@/app/lib/studentService";
import { requireAuth } from "@/app/lib/apiAuth";

export async function GET() {
  const auth = await requireAuth();

  if (!auth.authorized) {
    return auth.response;
  }

  const students = await getStudents();
  return NextResponse.json(students);
}
