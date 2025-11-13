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
