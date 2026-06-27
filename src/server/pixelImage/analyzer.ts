import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { OptionalType } from "./parser";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;

const isOptionalType = (type: string): type is OptionalType => {
  return ["jpeg", "png"].includes(type);
};

const assertImageUrl = (url: string): URL => {
  const parsedUrl = new URL(url);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("image URL must use http or https");
  }
  return parsedUrl;
};

const isPrivateIPv4 = (address: string): boolean => {
  const parts = address.split(".").map((part) => Number(part));
  const [first, second] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 0 && parts[2] === 2) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && parts[2] === 100) ||
    (first === 203 && second === 0 && parts[2] === 113) ||
    first >= 224
  );
};

const isPrivateIPv6 = (address: string): boolean => {
  const normalized = address.toLowerCase();
  const ipv4MappedAddress = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (ipv4MappedAddress) {
    return isPrivateIPv4(ipv4MappedAddress);
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("2001:db8")
  );
};

export const isBlockedAddress = (address: string): boolean => {
  const version = isIP(address);
  if (version === 4) return isPrivateIPv4(address);
  if (version === 6) return isPrivateIPv6(address);
  return true;
};

const assertPublicHostname = async (url: URL): Promise<void> => {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(hostname)) {
    if (isBlockedAddress(hostname)) {
      throw new Error("image URL must not resolve to a private address");
    }
    return;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new Error("image URL must not resolve to a private address");
  }
};

const parseImageType = (contentType: string | null): OptionalType => {
  const type = contentType?.split(";")[0]?.split("/")[1];
  if (!type || !isOptionalType(type)) {
    throw new Error("image must be jpeg or png");
  }
  return type;
};

export const analyzeImage = async (url: string) => {
  let imageUrl = assertImageUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let response: Response | undefined;
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      await assertPublicHostname(imageUrl);
      response = await fetch(imageUrl.toString(), {
        redirect: "manual",
        signal: controller.signal,
      });

      if (![301, 302, 303, 307, 308].includes(response.status)) {
        break;
      }

      const location = response.headers.get("location");
      if (!location) {
        throw new Error("image redirect is missing location");
      }

      imageUrl = assertImageUrl(new URL(location, imageUrl).toString());
    }

    if (!response || [301, 302, 303, 307, 308].includes(response.status)) {
      throw new Error("image has too many redirects");
    }

    if (!response.ok) {
      throw new Error(`image request failed: ${response.status}`);
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      throw new Error("image is too large");
    }

    parseImageType(response.headers.get("content-type"));
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      throw new Error("image is too large");
    }

    return {
      imageBuffer: Buffer.from(arrayBuffer),
    };
  } finally {
    clearTimeout(timeout);
  }
};
