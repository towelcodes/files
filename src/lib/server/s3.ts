import {
  S3_ENDPOINT,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
} from "$env/static/private";
import { AwsClient } from "aws4fetch";

export const client = new AwsClient({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
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
  console.log("getting:", key);
  console.log(platform.env.bucket.get);
  console.log(await platform.env.bucket.get(key));
  return await platform.env.bucket.get(key);
}

export async function check(platform: App.Platform, key: string) {
  console.log("checking: ", key);
  console.log(platform.env.bucket.head);
  console.log(await platform.env.bucket.head(key));
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

export function getAmzDate() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  const amzDate = `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
  const dateStamp = `${yyyy}${mm}${dd}`;
  return { amzDate, dateStamp };
}
