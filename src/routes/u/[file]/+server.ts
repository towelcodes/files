import { redirect } from "@sveltejs/kit";
import { get, getPublicUrl } from "$lib/server/s3";
import { isBrowser } from "$lib/util";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, params, platform }) => {
  if (isBrowser(request.headers)) {
    redirect(303, `/v/${params.file}/`);
  }

  console.log(platform);
  const publicUrl = await getPublicUrl(params.file);
  if (!publicUrl) {
    return new Response(JSON.stringify({ message: "not found" }), {
      status: 404,
    });
  }

  redirect(303, publicUrl);
};
