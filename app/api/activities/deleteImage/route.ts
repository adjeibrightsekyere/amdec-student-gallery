import { NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/apiAuth";
import { removeImageFromActivity } from "@/app/lib/activityService";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/app/lib/s3";

export async function POST(request: Request) {
  const auth = await requireAuth("admin");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { activityId, imageUrl } = body;

  if (!activityId || !imageUrl) {
    return NextResponse.json({ error: "activityId and imageUrl required" }, { status: 400 });
  }

  try {
    // attempt to delete object from S3 if we can parse the key
    try {
      const url = new URL(imageUrl);
      const key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.MY_AWS_BUCKET_NAME!, Key: key }));
    } catch (err) {
      // ignore S3 delete errors, still remove DB reference
      console.error("S3 delete failed", err);
    }

    await removeImageFromActivity(Number(activityId), imageUrl);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to remove image" }, { status: 500 });
  }
}
