import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/app/lib/s3";
import { getStudents, addStudent, updateStudent } from "@/app/lib/studentService";
import { Student } from "@/app/types/student";
import { requireAuth } from "@/app/lib/apiAuth";

export async function POST(request: Request) {
  const auth = await requireAuth("admin");

  if (!auth.authorized) {
    return auth.response;
  }

  const formData = await request.formData();
  const name = formData.get("name")?.toString()?.trim();
  const studentClass = formData.get("class")?.toString()?.trim();
  const idValue = formData.get("id")?.toString()?.trim();
  const imageFile = formData.get("image");

  if (!name || !studentClass || !imageFile) {
    return NextResponse.json({ error: "Name, class, and image are required." }, { status: 400 });
  }

  if (!(imageFile instanceof File)) {
    return NextResponse.json({ error: "Image upload failed." }, { status: 400 });
  }

  const students = await getStudents();
  const numericId = idValue ? Number(idValue) : undefined;
  const existingStudent = students.find((student) => {
    if (numericId && student.id === numericId) return true;
    return student.name.toLowerCase() === name.toLowerCase() && student.class === studentClass;
  });

  const safeFileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

const buffer = Buffer.from(await imageFile.arrayBuffer());

await s3.send(
  new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `${studentClass}/${safeFileName}`,
    Body: buffer,
    ContentType: imageFile.type,
  })
);

const publicPath = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${studentClass}/${safeFileName}`;

  

  let uploadedStudent: any;

if (existingStudent) {
  const updatedImages = [
    ...existingStudent.images,
    publicPath,
  ];

  await updateStudent(existingStudent.id, {
    images: updatedImages,
  });

  uploadedStudent = {
    ...existingStudent,
    images: updatedImages,
  };
} else {
  const nextId =
    students.reduce(
      (max: number, student: any) =>
        Math.max(max, student.id),
      0
    ) + 1;

  const newStudent: Student = {
    id: numericId ?? nextId,
    name,
    class: studentClass,
    images: [publicPath],
  };

  console.log("Adding new student:", newStudent);
  await addStudent(newStudent);

  uploadedStudent = newStudent;
}

  return NextResponse.json({ success: true, student: uploadedStudent });
}
