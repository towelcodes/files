import {
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
  S3_ENDPOINT,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} from "$env/static/private";
import type { R2Bucket } from "@cloudflare/workers-types";

export const client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

// TODO use multipart uploads for large files
export async function put(
  platform: App.Platform,
  data: ArrayBuffer,
  contentType: string,
  options?: {
    name?: string;
    metadata?: Record<string, string>;
  },
) {
  const key = options?.name ?? (await createUniqueId(platform));
  await platform.env.bucket.put(key, data, {
    customMetadata: options?.metadata,
    httpMetadata: {
      contentType,
    },
  });
  return key;
}

export async function get(platform: App.Platform, key: string) {
  return await platform.env.bucket.get(key);
}

export async function check(platform: App.Platform, key: string) {
  return await platform.env.bucket.head(key);
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function createId(len = 5) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function createUniqueId(platform: App.Platform) {
  for (;;) {
    const id = createId(5);
    if ((await platform.env.bucket.head(id)) == null) {
      return id;
    }
  }
}
