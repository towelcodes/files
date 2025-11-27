import type { RequestHandler } from "./$types";
import { S3_ENDPOINT, S3_BUCKET } from "$env/static/private";
import { env } from "$env/dynamic/public";
import { env as privateEnv } from "$env/dynamic/private";
import { client, createUniqueId } from "$lib/server/s3";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  let key = "";
  let size = 0;
  try {
    const json = await request.json();
    key = json.key ?? (await createUniqueId());

    if (json.size == undefined) {
      error(400);
    } else if (env.PUBLIC_MAX_SIZE != undefined) {
      if (json.size > parseInt(env.PUBLIC_MAX_SIZE)) {
        error(413);
      }
    }
    size = json.size;
  } catch {
    error(400);
  }

  const url = new URL(`https://${S3_BUCKET}.${S3_ENDPOINT}/${key}`);
  const signed = await client.sign(
    new Request(url, {
      method: "PUT",
      headers: {
        "Content-Length": `${size}`,
      },
    }),
    {
      aws: { signQuery: true },
    },
  );

  console.log("Created upload", { ip: getClientAddress() });

  // log to webhook if enabled
  if (privateEnv.UPLOAD_WEBHOOK != undefined) {
    try {
      await fetch(privateEnv.UPLOAD_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [
            {
              title: `upload created | ${key}`,
              fields: [
                {
                  name: "size",
                  value: size,
                },
                {
                  name: "ip",
                  value: getClientAddress(),
                },
              ],
            },
          ],
        }),
      });
    } catch (e) {
      console.warn("sending webhook failed: ", e);
    }
  }

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
