import type { NextApiRequest } from "next";
import { BadRequestError } from "./errors";
import { createTvEffectOptions, isTvEffectPreset } from "./tvEffect/presets";
import { DEFAULT_TV_EFFECT_STRENGTH } from "./tvEffect/types";
import type { TvEffectOptions } from "./tvEffect/types";

export type OptionalType = "jpeg" | "png";

export type ParsedOptions = {
  image: string;
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

export type ParsedUploadOptions = ParsedOptions & {
  imageDataUrl: string;
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

const assertSingleString = (value: unknown, name: string): string | undefined => {
  if (Array.isArray(value)) throw new BadRequestError("must not be array");
  if (typeof value === "undefined") return undefined;
  if (typeof value !== "string") throw new BadRequestError(`${name} must be a string`);
  return value;
};

const parseOptions = ({
  image,
  type = "jpeg",
  size = "15",
  sampleSize,
  pixelSize,
  k = "8",
  tv = "0",
  tvPreset = "soft-tv",
  tvStrength = String(DEFAULT_TV_EFFECT_STRENGTH),
}: {
  image: string;
  type?: string;
  size?: string;
  sampleSize?: string;
  pixelSize?: string;
  k?: string;
  tv?: string;
  tvPreset?: string;
  tvStrength?: string;
}): ParsedOptions => {
  if (!isOptionalType(type)) throw new BadRequestError("type must be jpeg or png");

  const tvEnabled = parseTvEnabled(tv);
  const parsedSize = parseInteger(size, "size", 1, 50);
  const parsedSampleSize = parseInteger(sampleSize ?? size, "sampleSize", 1, 50);
  const parsedPixelSize = parseInteger(pixelSize ?? size, "pixelSize", 1, 50);
  const parsedK = parseInteger(k, "k", 1, 50);

  if (!tvEnabled) {
    return {
      image,
      type,
      size: parsedSize,
      sampleSize: parsedSampleSize,
      pixelSize: parsedPixelSize,
      k: parsedK,
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
    image,
    type,
    size: parsedSize,
    sampleSize: parsedSampleSize,
    pixelSize: parsedPixelSize,
    k: parsedK,
    tvEffect: createTvEffectOptions({
      enabled: true,
      preset: tvPreset,
      strength,
      cellSize: parsedPixelSize,
    }),
  };
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

  return parseOptions({
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

export const parsePostRequest = (req: NextApiRequest): ParsedUploadOptions => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new BadRequestError("request body must be a JSON object");
  }

  const body = req.body as Record<string, unknown>;
  const imageDataUrl = assertSingleString(body.imageDataUrl, "imageDataUrl");
  if (!imageDataUrl) throw new BadRequestError("imageDataUrl is required");

  const parsed = parseOptions({
    image: "local-upload",
    type: assertSingleString(body.type, "type") ?? "png",
    size: assertSingleString(body.size, "size") ?? "15",
    sampleSize: assertSingleString(body.sampleSize, "sampleSize"),
    pixelSize: assertSingleString(body.pixelSize, "pixelSize"),
    k: assertSingleString(body.k, "k") ?? "8",
    tv: assertSingleString(body.tv, "tv") ?? "0",
    tvPreset: assertSingleString(body.tvPreset, "tvPreset") ?? "soft-tv",
    tvStrength:
      assertSingleString(body.tvStrength, "tvStrength") ?? String(DEFAULT_TV_EFFECT_STRENGTH),
  });

  return {
    ...parsed,
    imageDataUrl,
  };
};
