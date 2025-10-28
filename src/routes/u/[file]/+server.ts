import { redirect } from "@sveltejs/kit";
import { get } from "$lib/server/s3";
import { isBrowser } from "$lib/util";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, params }) => {
  if (isBrowser(request.headers)) {
    redirect(303, `/v/${params.file}/`);
  }

  try {
    const res = await get(params.file);

    if (!res.Body) return new Response(null, { status: 404 });

    return new Response(res.Body as any, {
      headers: {
        "Content-Type": res.ContentType ?? "application/octet-stream",
        "Content-Length": res.ContentLength?.toString() ?? "",
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
