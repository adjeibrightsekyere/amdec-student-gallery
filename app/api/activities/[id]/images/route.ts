import { NextResponse, NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/app/lib/s3";
import { requireAuth } from "@/app/lib/apiAuth";
import { UpdateFilter } from "mongodb";
import { getActivities, pushImagesToActivity } from "@/app/lib/activityService";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
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
        ACL: "public-read",
      })
    );

    const publicPath = `https://${process.env.MY_AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${keyPath}`;
    uploaded.push(publicPath);
  }

  // push uploaded into activity.images
  await pushImagesToActivity(activityId, uploaded);

  return NextResponse.json({ success: true, images: uploaded });
}
