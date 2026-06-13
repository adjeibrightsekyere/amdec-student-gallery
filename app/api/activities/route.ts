import { NextResponse, NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/app/lib/s3";
import { requireAuth } from "@/app/lib/apiAuth";
import { getActivities, addActivity } from "@/app/lib/activityService";

export async function GET(request: NextRequest) {
  try {
    const activities = await getActivities();
    activities.sort((a: any, b: any) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
    return NextResponse.json(activities);
  } catch (err) {
    console.error("GET /api/activities error", err);
    return NextResponse.json({ error: "Failed to load activities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth("admin");
  if (!auth.authorized) return auth.response;

  const formData = await request.formData();
  const name = formData.get("activityName")?.toString()?.trim();
  const dateValue = formData.get("date")?.toString()?.trim();
  const classValue = formData.get("class")?.toString()?.trim();

  if (!name || !dateValue) {
    return NextResponse.json({ error: "Activity name and date are required." }, { status: 400 });
  }

  const files = formData.getAll("images");
  if (!files || files.length === 0) {
    return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
  }

  const region = process.env.MY_AWS_REGION;
  const bucketName = process.env.MY_AWS_BUCKET_NAME!;
  const host = region
    ? `${bucketName}.s3.${region}.amazonaws.com`
    : `${bucketName}.s3.amazonaws.com`;

  const uploadPromises = files
    .filter((file): file is File => file instanceof File)
    .map(async (file) => {
      const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const keyPath = classValue
        ? `activities/${classValue}/${safeFileName}`
        : `activities/${safeFileName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: keyPath,
          Body: buffer,
          ContentType: file.type,
        })
      );

      return `https://${host}/${keyPath}`;
    });

  const uploadedPaths = await Promise.all(uploadPromises);

  const activities = await getActivities();
  const nextId = (activities.reduce((max: number, a: any) => Math.max(max, a.id || 0), 0) || 0) + 1;

  const activity = {
    id: nextId,
    name,
    date: new Date(dateValue).toISOString(),
    images: uploadedPaths,
    class: classValue || null,
    createdAt: new Date().toISOString(),
  };

  await addActivity(activity);

  return NextResponse.json({ success: true, activity });
}