import { NextResponse, NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/app/lib/s3";
import { requireAuth } from "@/app/lib/apiAuth";
import { pushImagesToActivity } from "@/app/lib/activityService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("admin");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const activityId = Number(id);
  if (!activityId) return NextResponse.json({ error: "Invalid activity id" }, { status: 400 });

  const formData = await request.formData();
  const files = formData.getAll("images");
  if (!files || files.length === 0) return NextResponse.json({ error: "No images provided" }, { status: 400 });

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
      const keyPath = `activities/${safeFileName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: keyPath,
          Body: buffer,
          ContentType: file.type || "application/octet-stream",
        })
      );

      return `https://${host}/${keyPath}`;
    });

  const uploaded = await Promise.all(uploadPromises);

  await pushImagesToActivity(activityId, uploaded);

  return NextResponse.json({ success: true, images: uploaded });
}