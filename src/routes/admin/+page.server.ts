import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { verifySession } from "$lib/server/session";
import { DISCORD_SESSION_SECRET } from "$env/static/private";
import { getFilesRepo } from "$lib/server/get-files-repo";
import { isAdmin } from "$lib/server/admin";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const user = await verifySession(
    cookies.get("session"),
    DISCORD_SESSION_SECRET,
  );

  if (!isAdmin(user?.id)) {
    error(403, { message: "forbidden" });
  }

  const repo = getFilesRepo(platform);
  const files = await repo.listAll();

  return {
    user: user
      ? {
          displayName: user.display_name ?? user.username,
          avatarUrl: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : undefined,
        }
      : null,
    files,
  };
};