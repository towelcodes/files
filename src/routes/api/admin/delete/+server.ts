import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { verifySession } from "$lib/server/session";
import { DISCORD_SESSION_SECRET } from "$env/static/private";
import { getFilesRepo } from "$lib/server/get-files-repo";
import { remove } from "$lib/server/s3";
import { isAdmin } from "$lib/server/admin";

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
  const user = await verifySession(
    cookies.get("session"),
    DISCORD_SESSION_SECRET,
  );
  if (!isAdmin(user?.id)) {
    error(403, { message: "forbidden" });
  }

  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    error(400, { message: "missing json body" });
  }

  if (!body.key) {
    error(400, { message: "missing `key` property" });
  }

  // delete from R2 first, then the metadata row
  await remove(body.key);
  const repo = getFilesRepo(platform);
  await repo.delete(body.key);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};