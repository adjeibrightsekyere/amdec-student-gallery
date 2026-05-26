import { NextResponse } from "next/server";
import { getStudents } from "@/app/lib/studentService";

export async function GET() {
  const students = await getStudents();
  return NextResponse.json(students);
}
