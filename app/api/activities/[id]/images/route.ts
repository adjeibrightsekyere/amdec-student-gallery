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

  const uploaded: string[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;
    const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const keyPath = `activities/${safeFileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.MY_AWS_BUCKET_NAME!,
        Key: keyPath,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const region = process.env.MY_AWS_REGION;
    const host = region
      ? `${process.env.MY_AWS_BUCKET_NAME}.s3.${region}.amazonaws.com`
      : `${process.env.MY_AWS_BUCKET_NAME}.s3.amazonaws.com`;
    const publicPath = `https://${host}/${keyPath}`;
    uploaded.push(publicPath);
  }

  await pushImagesToActivity(activityId, uploaded);

  return NextResponse.json({ success: true, images: uploaded });
}