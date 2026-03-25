import { S3Client } from '@aws-sdk/client-s3';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? 'mebira-videos';

/** Build the public URL for a stored object key. */
export function getPublicUrl(key: string): string {
  const base = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!base) throw new Error('CLOUDFLARE_R2_PUBLIC_URL is not set');
  return `${base.replace(/\/+$/, '')}/${key}`;
}
