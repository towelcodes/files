export function isBrowser(headers: Headers): boolean {
  const accept = headers.get("accept") ?? "";
  const sec = headers.get("sec-fetch-mode") ?? ""; // sec.length > 0
  if (accept.includes("text/html")) {
    return true;
  }
  return false;
}

const byteToHex: string[] = [];

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, "0");
  byteToHex.push(hexOctet);
}

// thank you https://stackoverflow.com/questions/40031688/how-can-i-convert-an-arraybuffer-to-a-hexadecimal-string-hex
export function hex(arrayBuffer: ArrayBuffer) {
  const buff = new Uint8Array(arrayBuffer);
  const hexOctets = []; // new Array(buff.length) is even faster (preallocates necessary array size), then use hexOctets[i] instead of .push()

  for (let i = 0; i < buff.length; ++i) hexOctets.push(byteToHex[buff[i]]);

  return hexOctets.join("");
}

export async function hmacSign(keyStr: string, msg: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(keyStr),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createUpload(size: number, key?: string) {
  const body = {
    size,
    key,
  };
  const res = await fetch("/api/upload/create", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (res.status != 200) {
    console.error(res);
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return {
    key: json.key,
    signed: json.signed,
  };
}
