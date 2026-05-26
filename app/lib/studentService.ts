import { getDb } from "./mongodb";

export async function getStudents() {
  const db = await getDb();

  return db.collection("students").find({}).toArray();
}

export async function addStudent(student: any) {
  const db = await getDb();

  return db.collection("students").insertOne(student);
}

export async function updateStudent(id: number, data: any) {
  const db = await getDb();

  return db.collection("students").updateOne(
    { id },
    { $set: data }
  );
}