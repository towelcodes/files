import { env } from "$env/dynamic/private";

/**
 * Admin user IDs, from the `ADMIN_IDS` env var (comma-separated Discord IDs).
 */
export function getAdminIds(): string[] {
  return (env.ADMIN_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdmin(userId: string | undefined): boolean {
  if (!userId) return false;
  return getAdminIds().includes(userId);
}