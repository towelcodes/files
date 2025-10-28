export function isBrowser(headers: Headers): boolean {
  const accept = headers.get("accept") ?? "";
  const sec = headers.get("sec-fetch-mode") ?? ""; // sec.length > 0
  if (accept.includes("text/html")) {
    return true;
  }
  return false;
}
