import { redirect } from "@sveltejs/kit";
import { get } from "$lib/server/s3";
import { isBrowser } from "$lib/util";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, params, platform }) => {
  if (isBrowser(request.headers)) {
    redirect(303, `/v/${params.file}/`);
  }

  try {
    console.log(platform);
    const object = await get(params.file);

    if (object == undefined) return new Response(null, { status: 404 });

    return new Response(object.body as any, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type":
          object.headers.get("Content-Type") ?? "application/octet-stream",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        message: "not found",
      }),
      { status: 404 },
    );
  }
};
