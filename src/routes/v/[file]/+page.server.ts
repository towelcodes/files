import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { isBrowser } from "$lib/util";
import { check } from "$lib/server/s3";

export const load: PageServerLoad = async ({ params, request }) => {
  if (!isBrowser(request.headers)) {
    redirect(303, `/u/${params.file}`);
  }

  // fetch the file
  const res = await check(`${params.file}`);

  if (res == false) {
    return error(404, "Not found");
  }

  return {
    file: params.file,
    contentType: res.ContentType!!,
    lastModified: res.LastModified!!,
  };
};
