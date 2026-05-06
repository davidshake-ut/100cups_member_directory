import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// Read env vars lazily so editing .env.local during dev doesn't require a
// server restart, and so a missing var fails with a clear message instead of
// the generic AWS SDK "No value provided for input HTTP label: Bucket".
function getR2(): { client: S3Client; bucket: string } {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    const missing = [
      !accountId && "R2_ACCOUNT_ID",
      !accessKeyId && "R2_ACCESS_KEY_ID",
      !secretAccessKey && "R2_SECRET_ACCESS_KEY",
      !bucket && "R2_BUCKET",
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(`R2 env vars not set: ${missing}`);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return { client, bucket };
}

export function publicPhotoUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!base) return null;
  return `${base}/${key}`;
}

export async function uploadPhoto(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const { client, bucket } = getR2();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deletePhoto(key: string): Promise<void> {
  const { client, bucket } = getR2();
  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key }),
  );
}
