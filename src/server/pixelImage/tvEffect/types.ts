export type TvEffectPreset =
  | "soft-tv"
  | "ntsc"
  | "crt"
  | "famicom-composite"
  | "sharp-emulator";

export type TvEffectParams = {
  horizontalBleed: number;
  bleedRadius: number;
  bleedStrength: number;
  chromaticAberration: number;
  redOffset: number;
  blueOffset: number;
  scanlineStrength: number;
  scanlineFrequency: number;
  scanlineThickness: number;
  bloomStrength: number;
  bloomThreshold: number;
  bloomRadius: number;
  saturation: number;
  contrast: number;
  gamma: number;
  brightness: number;
  blackLevel: number;
};

export type TvEffectOptions = {
  enabled: boolean;
  preset: TvEffectPreset;
  strength: number;
  params: TvEffectParams;
};

export const DEFAULT_TV_EFFECT_PRESET: TvEffectPreset = "soft-tv";
export const DEFAULT_TV_EFFECT_STRENGTH = 60;
