import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { isBrowser } from "$lib/util";
import { check, getPublicUrl } from "$lib/server/s3";

export const load: PageServerLoad = async ({ params, request, platform }) => {
  if (!isBrowser(request.headers)) {
    redirect(303, `/u/${params.file}`);
  }

  // fetch the file
  const object = await check(`${params.file}`);

  if (object == null) {
    return error(404, "Not found");
  }

  return {
    file: params.file,
    lastModified: object.headers.get("Last-Modified"),
    size: parseInt(object.headers.get("Content-Length")!!),
    uploader: "anonymous",
    raw: await getPublicUrl(`${params.file}`),
    contentType:
      object.headers.get("Content-Type") ?? "application/octet-stream",
  };
};
