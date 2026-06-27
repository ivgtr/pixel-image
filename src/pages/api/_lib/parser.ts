import { VercelRequest } from "@vercel/node";
import {
  DEFAULT_TV_EFFECT_OPTIONS,
  TvEffectOptions,
  isTvEffectPreset,
  clamp,
} from "./tvEffect";

export type OptionalType = "jpeg" | "png";

export type ParsedOptions = {
  image: string;
  type: OptionalType;
  size: number;
  k: number;
  tvEffect: TvEffectOptions;
};

const isOptionalType = (type: string): type is OptionalType => {
  return ["jpeg", "png"].includes(type);
};

const getQueryValue = (
  value: string | string[] | undefined,
  name: string,
  defaultValue?: string
): string => {
  if (Array.isArray(value)) throw new Error(`${name} must not be array`);
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`${name} is required`);
  }
  return value;
};

const parseTvEffectOptions = (req: VercelRequest): TvEffectOptions => {
  const tv = getQueryValue(req.query.tv, "tv", "0");
  const tvPreset = getQueryValue(req.query.tvPreset, "tvPreset", DEFAULT_TV_EFFECT_OPTIONS.preset);
  const tvStrength = getQueryValue(
    req.query.tvStrength,
    "tvStrength",
    String(DEFAULT_TV_EFFECT_OPTIONS.strength)
  );
  const strength = Number(tvStrength);

  return {
    enabled: tv === "1" || tv === "true",
    preset: isTvEffectPreset(tvPreset) ? tvPreset : DEFAULT_TV_EFFECT_OPTIONS.preset,
    strength: Number.isNaN(strength)
      ? DEFAULT_TV_EFFECT_OPTIONS.strength
      : clamp(strength, 0, 100),
  };
};

export const parseRequest = (req: VercelRequest): ParsedOptions => {
  const image = getQueryValue(req.query.image, "image");
  const type = getQueryValue(req.query.type, "type", "jpeg");
  const size = getQueryValue(req.query.size, "size", "15");
  const k = getQueryValue(req.query.k, "k", "8");

  if (!isOptionalType(type)) throw new Error("type is invalid");

  return {
    image,
    type,
    size: Number(size),
    k: Number(k),
    tvEffect: parseTvEffectOptions(req),
  };
};
