import { NextResponse } from "next/server";
import { getStudents } from "@/app/lib/studentService";

export async function GET() {
  const students = await getStudents();

  const classes = [
    ...new Set(students.map((student: any) => student.class)),
  ];

  return NextResponse.json(classes);
}