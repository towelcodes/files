import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { isBrowser } from "$lib/util";
import { check } from "$lib/server/s3";

export const load: PageServerLoad = async ({ params, request, platform }) => {
  if (!isBrowser(request.headers)) {
    redirect(303, `/u/${params.file}`);
  }

  // fetch the file
  const object = await check(platform!!, `${params.file}`);

  if (object == null) {
    return error(404, "Not found");
  }

  return {
    file: params.file,
    lastModified: object.uploaded,
    contentType: object.httpMetadata?.contentType ?? "application/octet-stream",
  };
};
