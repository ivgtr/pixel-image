import type { TvEffectOptions, TvEffectParams, TvEffectPreset } from "./types";
import { DEFAULT_TV_EFFECT_PRESET, DEFAULT_TV_EFFECT_STRENGTH } from "./types";

export const tvEffectPresetValues: TvEffectPreset[] = [
  "soft-tv",
  "ntsc",
  "crt",
  "famicom-composite",
  "sharp-emulator",
];

const tvEffectPresets: Record<TvEffectPreset, TvEffectParams> = {
  "soft-tv": {
    horizontalBleed: 0.35,
    bleedRadius: 1,
    bleedStrength: 0.35,
    chromaticAberration: 0.12,
    redOffset: 1,
    blueOffset: -1,
    scanlineStrength: 0.1,
    scanlineFrequency: 2,
    scanlineThickness: 1,
    bloomStrength: 0.06,
    bloomThreshold: 215,
    bloomRadius: 2,
    saturation: 1.04,
    contrast: 1.03,
    gamma: 1,
    brightness: 1,
    blackLevel: 0,
  },
  ntsc: {
    horizontalBleed: 0.5,
    bleedRadius: 2,
    bleedStrength: 0.45,
    chromaticAberration: 0.22,
    redOffset: 1,
    blueOffset: -1,
    scanlineStrength: 0.08,
    scanlineFrequency: 2,
    scanlineThickness: 1,
    bloomStrength: 0.05,
    bloomThreshold: 220,
    bloomRadius: 2,
    saturation: 1.1,
    contrast: 1.04,
    gamma: 0.98,
    brightness: 1,
    blackLevel: 0.02,
  },
  crt: {
    horizontalBleed: 0.3,
    bleedRadius: 1,
    bleedStrength: 0.3,
    chromaticAberration: 0.16,
    redOffset: 1,
    blueOffset: -1,
    scanlineStrength: 0.18,
    scanlineFrequency: 2,
    scanlineThickness: 1,
    bloomStrength: 0.1,
    bloomThreshold: 205,
    bloomRadius: 2,
    saturation: 1.06,
    contrast: 1.08,
    gamma: 1.02,
    brightness: 0.98,
    blackLevel: 0.03,
  },
  "famicom-composite": {
    horizontalBleed: 0.55,
    bleedRadius: 2,
    bleedStrength: 0.5,
    chromaticAberration: 0.18,
    redOffset: 1,
    blueOffset: -1,
    scanlineStrength: 0.1,
    scanlineFrequency: 2,
    scanlineThickness: 1,
    bloomStrength: 0.04,
    bloomThreshold: 225,
    bloomRadius: 1,
    saturation: 1.12,
    contrast: 1.06,
    gamma: 0.95,
    brightness: 1,
    blackLevel: 0.04,
  },
  "sharp-emulator": {
    horizontalBleed: 0.12,
    bleedRadius: 1,
    bleedStrength: 0.12,
    chromaticAberration: 0.04,
    redOffset: 1,
    blueOffset: -1,
    scanlineStrength: 0.05,
    scanlineFrequency: 2,
    scanlineThickness: 1,
    bloomStrength: 0.02,
    bloomThreshold: 230,
    bloomRadius: 1,
    saturation: 1,
    contrast: 1.02,
    gamma: 1,
    brightness: 1,
    blackLevel: 0,
  },
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const scaleOffset = (offset: number, scale: number): number => {
  if (offset === 0) return 0;
  return Math.sign(offset) * Math.max(1, Math.round(Math.abs(offset) * scale * 0.12));
};

export const isTvEffectPreset = (preset: string): preset is TvEffectPreset => {
  return tvEffectPresetValues.includes(preset as TvEffectPreset);
};

export const applyStrengthToPreset = (
  params: TvEffectParams,
  strength: number,
): TvEffectParams => {
  const normalizedStrength = clamp(strength / 100, 0, 1);

  return {
    ...params,
    horizontalBleed: params.horizontalBleed * normalizedStrength,
    bleedStrength: params.bleedStrength * normalizedStrength,
    chromaticAberration: params.chromaticAberration * normalizedStrength,
    scanlineStrength: params.scanlineStrength * normalizedStrength,
    bloomStrength: params.bloomStrength * normalizedStrength,
  };
};

export const resolveTvEffectParams = (
  preset: TvEffectPreset,
  strength: number,
  cellSize = 1,
): TvEffectParams => {
  const params = applyStrengthToPreset(tvEffectPresets[preset], strength);
  const scale = Math.max(1, cellSize);

  return {
    ...params,
    bleedRadius: Math.max(params.bleedRadius, Math.round(params.bleedRadius * scale * 0.45)),
    bloomRadius: Math.max(params.bloomRadius, Math.round(params.bloomRadius * scale * 0.18)),
    redOffset: scaleOffset(params.redOffset, scale),
    blueOffset: scaleOffset(params.blueOffset, scale),
  };
};

export const createTvEffectOptions = ({
  enabled = false,
  preset = DEFAULT_TV_EFFECT_PRESET,
  strength = DEFAULT_TV_EFFECT_STRENGTH,
  cellSize = 1,
}: {
  enabled?: boolean;
  preset?: TvEffectPreset;
  strength?: number;
  cellSize?: number;
} = {}): TvEffectOptions => {
  return {
    enabled,
    preset,
    strength,
    params: resolveTvEffectParams(preset, strength, cellSize),
  };
};
