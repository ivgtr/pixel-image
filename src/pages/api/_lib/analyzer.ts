import type { OptionalType } from "./parser";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

const parseImageType = (contentType: string | null): OptionalType => {
  const type = contentType?.split(";")[0]?.split("/")[1];
  if (!type || !isOptionalType(type)) {
    throw new Error("image must be jpeg or png");
  }
  return type;
};

export const analyzeImage = async (url: string) => {
  const imageUrl = assertImageUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(imageUrl.toString(), { signal: controller.signal });
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
