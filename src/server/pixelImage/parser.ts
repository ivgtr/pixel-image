import type { NextApiRequest } from "next";
import { BadRequestError } from "./errors";
import { createTvEffectOptions, isTvEffectPreset } from "./tvEffect/presets";
import { DEFAULT_TV_EFFECT_STRENGTH } from "./tvEffect/types";
import type { TvEffectOptions } from "./tvEffect/types";

export type OptionalType = "jpeg" | "png";

export type ParsedOptions = {
  image: string;
  imageDataUrl?: string;
  type: OptionalType;
  /**
   * Backward compatible input value. Runtime image generation should use
   * sampleSize and pixelSize instead.
   */
  size: number;
  sampleSize: number;
  pixelSize: number;
  k: number;
  tvEffect: TvEffectOptions;
};

const isOptionalType = (type: string): type is OptionalType => {
  return ["jpeg", "png"].includes(type);
};

const parseInteger = (value: string, name: string, min: number, max: number): number => {
  if (!/^\d+$/.test(value)) {
    throw new BadRequestError(`${name} must be an integer`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new BadRequestError(`${name} must be between ${min} and ${max}`);
  }

  return parsed;
};

const parseTvEnabled = (value: string): boolean => {
  if (value === "0") return false;
  if (value === "1") return true;
  throw new BadRequestError("tv must be 0 or 1");
};

const createImageDataUrlField = (imageDataUrl: string | undefined) => {
  return imageDataUrl ? { imageDataUrl } : {};
};

const createParsedOptions = ({
  image,
  imageDataUrl,
  type,
  size,
  sampleSize,
  pixelSize,
  k,
  tv,
  tvPreset,
  tvStrength,
}: {
  image: string;
  imageDataUrl?: string;
  type: string;
  size: string;
  sampleSize?: string;
  pixelSize?: string;
  k: string;
  tv: string;
  tvPreset: string;
  tvStrength: string;
}): ParsedOptions => {
  if (!isOptionalType(type)) throw new BadRequestError("type must be jpeg or png");

  const tvEnabled = parseTvEnabled(tv);
  const parsedSize = parseInteger(size, "size", 1, 50);
  const parsedSampleSize = parseInteger(sampleSize ?? size, "sampleSize", 1, 50);
  const parsedPixelSize = parseInteger(pixelSize ?? size, "pixelSize", 1, 50);
  const parsedK = parseInteger(k, "k", 1, 50);
  const baseOptions = {
    image,
    ...createImageDataUrlField(imageDataUrl),
    type,
    size: parsedSize,
    sampleSize: parsedSampleSize,
    pixelSize: parsedPixelSize,
    k: parsedK,
  };

  if (!tvEnabled) {
    return {
      ...baseOptions,
      tvEffect: createTvEffectOptions({ enabled: false }),
    };
  }

  if (!isTvEffectPreset(tvPreset)) {
    throw new BadRequestError(
      "tvPreset must be soft-tv, ntsc, crt, famicom-composite, or sharp-emulator",
    );
  }

  const strength = parseInteger(tvStrength, "tvStrength", 0, 100);

  return {
    ...baseOptions,
    tvEffect: createTvEffectOptions({
      enabled: true,
      preset: tvPreset,
      strength,
      cellSize: parsedPixelSize,
    }),
  };
};

const readBodyString = (
  body: Record<string, unknown>,
  key: string,
  fallback?: string,
): string | undefined => {
  const value = body[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") {
    throw new BadRequestError(`${key} must be a string`);
  }
  return value;
};

export const parseRequest = (req: NextApiRequest): ParsedOptions => {
  const {
    image,
    type = "jpeg",
    size = "15",
    sampleSize,
    pixelSize,
    k = "8",
    tv = "0",
    tvPreset = "soft-tv",
    tvStrength = String(DEFAULT_TV_EFFECT_STRENGTH),
  } = req.query;

  if (Array.isArray(image)) throw new BadRequestError("must not be array");
  if (Array.isArray(size)) throw new BadRequestError("must not be array");
  if (Array.isArray(sampleSize)) throw new BadRequestError("must not be array");
  if (Array.isArray(pixelSize)) throw new BadRequestError("must not be array");
  if (Array.isArray(type)) throw new BadRequestError("must not be array");
  if (Array.isArray(k)) throw new BadRequestError("must not be array");
  if (Array.isArray(tv)) throw new BadRequestError("must not be array");
  if (Array.isArray(tvPreset)) throw new BadRequestError("must not be array");
  if (Array.isArray(tvStrength)) throw new BadRequestError("must not be array");
  if (!image) throw new BadRequestError("image is required");

  return createParsedOptions({
    image,
    type,
    size,
    sampleSize,
    pixelSize,
    k,
    tv,
    tvPreset,
    tvStrength,
  });
};

export const parsePostRequest = (req: NextApiRequest): ParsedOptions => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new BadRequestError("request body must be a JSON object");
  }

  const body = req.body as Record<string, unknown>;
  const imageDataUrl = readBodyString(body, "imageDataUrl");
  if (!imageDataUrl) throw new BadRequestError("imageDataUrl is required");

  const type = readBodyString(body, "type", "png");
  const size = readBodyString(body, "size", "15");
  const sampleSize = readBodyString(body, "sampleSize");
  const pixelSize = readBodyString(body, "pixelSize");
  const k = readBodyString(body, "k", "8");
  const tv = readBodyString(body, "tv", "0");
  const tvPreset = readBodyString(body, "tvPreset", "soft-tv");
  const tvStrength = readBodyString(body, "tvStrength", String(DEFAULT_TV_EFFECT_STRENGTH));

  return createParsedOptions({
    image: "local-upload",
    imageDataUrl,
    type: type ?? "png",
    size: size ?? "15",
    sampleSize,
    pixelSize,
    k: k ?? "8",
    tv: tv ?? "0",
    tvPreset: tvPreset ?? "soft-tv",
    tvStrength: tvStrength ?? String(DEFAULT_TV_EFFECT_STRENGTH),
  });
};
