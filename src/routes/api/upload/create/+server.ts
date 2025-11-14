import type { RequestHandler } from "./$types";
import {
  S3_ENDPOINT,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} from "$env/static/private";
import { createUniqueId, getAmzDate } from "$lib/server/s3";
import { hex, hmacSign } from "$lib/util";

export const POST: RequestHandler = async ({
  request,
  getClientAddress,
  fetch,
  platform,
}) => {
  let key = await createUniqueId(platform!!);
  const { amzDate, dateStamp } = getAmzDate();
  const enc = new TextEncoder();

  const method = "POST";
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const uri = `/${S3_BUCKET}/${key}`;
  const host = `${S3_ENDPOINT.substring(8)}`;
  const url = `${S3_ENDPOINT}${uri}`;

  const canonicalQuery = "uploads=";
  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:UNSIGNED-PAYLOAD\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest =
    `${method}\n` +
    `${uri}\n` +
    `${canonicalQuery}\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    "UNSIGNED-PAYLOAD";
  // `${hex(await crypto.subtle.digest("SHA-256", enc.encode("")))}`;
  console.log("REQUEST === \n" + canonicalRequest);

  const toSign =
    "AWS4-HMAC-SHA256\n" +
    `${amzDate}\n` +
    `${scope}\n` +
    hex(await crypto.subtle.digest("SHA-256", enc.encode(canonicalRequest)));
  console.log("TO SIGN === \n" + toSign);
  const signingKey = await hmacSign(
    await hmacSign(
      await hmacSign(
        await hmacSign("AWS4" + S3_SECRET_ACCESS_KEY, dateStamp),
        "auto",
      ),
      "s3",
    ),
    "aws4_request",
  );
  console.log("SIGNING KEY === \n" + signingKey);
  const signature = await hmacSign(signingKey, toSign);
  console.log("SIGNATURE === \n" + signature);

  const credential = `${S3_ACCESS_KEY_ID}/${dateStamp}/auto/s3/aws4_request`;
  const res = await fetch(`${url}?${canonicalQuery}`, {
    headers: {
      Authorization: `AWS4-HMAC-SHA256 Credential=${credential},SignedHeaders=${signedHeaders},Signature=${signature}`,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
    },
  });

  console.log(res);
  console.log(await res.text());

  return new Response(
    JSON.stringify({
      key,
    }),
    {
      status: res.status,
      headers: {
        ContentType: "application/json",
      },
    },
  );
};
