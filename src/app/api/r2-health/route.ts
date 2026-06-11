import { NextResponse } from "next/server";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export async function GET() {
  const vars = {
    R2_ACCOUNT_ID: !!process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: !!process.env.R2_BUCKET,
    R2_PUBLIC_URL: !!process.env.R2_PUBLIC_URL,
  };

  const missing = Object.entries(vars)
    .filter(([, set]) => !set)
    .map(([k]) => k);

  if (missing.length > 0) {
    return NextResponse.json({ status: "error", missing }, { status: 500 });
  }

  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    await client.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET! }));
    return NextResponse.json({ status: "ok", bucket: process.env.R2_BUCKET });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    );
  }
}
