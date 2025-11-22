import type { RequestHandler } from "./$types";
import {
  S3_ENDPOINT,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} from "$env/static/private";
import { client, createUniqueId } from "$lib/server/s3";

export const POST: RequestHandler = async ({
  request,
  getClientAddress,
  fetch,
  platform,
}) => {
  let key = "";
  try {
    const json = await request.json();
    key = json.key ?? (await createUniqueId(platform!!));
  } catch {
    key = await createUniqueId(platform!!);
  }

  const url = new URL(`https://${S3_BUCKET}.${S3_ENDPOINT}/${key}`);
  const signed = await client.sign(
    new Request(url, {
      method: "PUT",
    }),
    {
      aws: { signQuery: true },
    },
  );
  console.log(signed);

  return new Response(
    JSON.stringify({
      key,
      signed: signed.url,
    }),
    {
      status: 200,
      headers: {
        ContentType: "application/json",
      },
    },
  );
};
