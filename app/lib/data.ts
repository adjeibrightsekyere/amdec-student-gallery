import fs from "fs";
import path from "path";
import { Student } from "../types/student";

const studentsFile = path.join(process.cwd(), "app", "lib", "students.json");

export function getAllStudents(): Student[] {
  const raw = fs.readFileSync(studentsFile, "utf8");
  return JSON.parse(raw) as Student[];
}

export function saveAllStudents(students: Student[]) {
  fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2), "utf8");
}
