export function isBrowser(headers: Headers): boolean {
  const accept = headers.get("accept") ?? "";
  const sec = headers.get("sec-fetch-mode") ?? "";
  if (accept.includes("text/html") || sec.length > 0) {
    return true;
  }
  return false;
}
