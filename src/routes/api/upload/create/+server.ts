import type { RequestHandler } from "./$types";
import {
  S3_ENDPOINT,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} from "$env/static/private";
import { client, createUniqueId, getAmzDate } from "$lib/server/s3";
import { XMLParser } from "fast-xml-parser";

export const POST: RequestHandler = async ({
  request,
  getClientAddress,
  fetch,
  platform,
}) => {
  let { key = await createUniqueId(platform!!), parts = 1 } =
    await request.json();

  // create the multipart upload
  const uploadRes = await client.fetch(
    `https://${S3_BUCKET}.${S3_ENDPOINT}/${key}?uploads`,
    {
      method: "POST",
    },
  );
  console.log(uploadRes);

  if (uploadRes.status != 200) {
    console.error(await uploadRes.text());
    return new Response(null, {
      status: uploadRes.status,
    });
  }

  // parse response
  const parser = new XMLParser();
  const upload = parser.parse(await uploadRes.text());

  if (upload["InitiateMultipartUploadResult"]["UploadId"] == undefined) {
    console.error(upload);
    return new Response(null, {
      status: uploadRes.status || 500,
    });
  }

  const uploadId = upload["UploadId"];

  let preSignedParts = [];

  console.log("parts", parts);
  for (let i = 0; i < parts; i++) {
    const url = new URL(
      `https://${S3_BUCKET}.${S3_ENDPOINT}/${key}?partNumber=${i}&uploadId=${uploadId}`,
    );
    const signed = await client.sign(
      new Request(url, {
        method: "PUT",
      }),
      {
        aws: { signQuery: true },
      },
    );
    console.log("signed part", signed);
    preSignedParts.push(signed.url);
  }

  return new Response(
    JSON.stringify({
      key,
      preSignedParts,
    }),
    {
      status: 200,
      headers: {
        ContentType: "application/json",
      },
    },
  );
};
