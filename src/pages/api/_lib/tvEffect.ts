export type TvEffectPreset = "soft-tv" | "ntsc" | "crt" | "famicom-composite" | "sharp-emulator";

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
};

type ImageDataRenderingContext = {
  getImageData: (sx: number, sy: number, sw: number, sh: number) => ImageData;
  putImageData: (imageData: ImageData, dx: number, dy: number) => void;
};

type ApplyTvEffectOptions = {
  ctx: ImageDataRenderingContext;
  width: number;
  height: number;
  options: TvEffectOptions;
};

export const TV_EFFECT_PRESETS: TvEffectPreset[] = [
  "soft-tv",
  "ntsc",
  "crt",
  "famicom-composite",
  "sharp-emulator",
];

export const DEFAULT_TV_EFFECT_OPTIONS: TvEffectOptions = {
  enabled: false,
  preset: "soft-tv",
  strength: 60,
};

const PRESET_PARAMS: Record<TvEffectPreset, TvEffectParams> = {
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

export const isTvEffectPreset = (preset: string): preset is TvEffectPreset => {
  return (TV_EFFECT_PRESETS as string[]).includes(preset);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const lerp = (start: number, end: number, amount: number): number => {
  return start + (end - start) * amount;
};

export const resolveTvEffectParams = ({ preset, strength }: TvEffectOptions): TvEffectParams => {
  const base = PRESET_PARAMS[preset];
  const effectStrength = clamp(strength / 100, 0, 1);
  const colorStrength = effectStrength * 0.5;

  return {
    ...base,
    horizontalBleed: base.horizontalBleed * effectStrength,
    bleedStrength: base.bleedStrength * effectStrength,
    chromaticAberration: base.chromaticAberration * effectStrength,
    scanlineStrength: base.scanlineStrength * effectStrength,
    bloomStrength: base.bloomStrength * effectStrength,
    saturation: lerp(1, base.saturation, colorStrength),
    contrast: lerp(1, base.contrast, colorStrength),
    gamma: lerp(1, base.gamma, colorStrength),
    brightness: lerp(1, base.brightness, colorStrength),
    blackLevel: lerp(0, base.blackLevel, colorStrength),
  };
};

const getIndex = (x: number, y: number, width: number): number => {
  return (y * width + x) * 4;
};

const getClampedIndex = (x: number, y: number, width: number, height: number): number => {
  return getIndex(clamp(x, 0, width - 1), clamp(y, 0, height - 1), width);
};

const copyAlpha = (source: Uint8ClampedArray, output: Uint8ClampedArray): void => {
  for (let i = 3; i < source.length; i += 4) {
    output[i] = source[i];
  }
};

const applyHorizontalBleed = (
  source: Uint8ClampedArray,
  width: number,
  height: number,
  params: TvEffectParams
): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(source.length);
  copyAlpha(source, output);

  const radius = Math.max(1, Math.round(params.bleedRadius));
  const strength = clamp(params.horizontalBleed * params.bleedStrength, 0, 1);

  if (strength <= 0) {
    return new Uint8ClampedArray(source);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = getIndex(x, y, width);
      let r = source[index];
      let g = source[index + 1];
      let b = source[index + 2];
      let sampleCount = 1;

      for (let offset = 1; offset <= radius; offset++) {
        const leftIndex = getClampedIndex(x - offset, y, width, height);
        const rightIndex = getClampedIndex(x + offset, y, width, height);

        r += source[leftIndex] + source[rightIndex];
        g += source[leftIndex + 1] + source[rightIndex + 1];
        b += source[leftIndex + 2] + source[rightIndex + 2];
        sampleCount += 2;
      }

      output[index] = clamp(lerp(source[index], r / sampleCount, strength), 0, 255);
      output[index + 1] = clamp(lerp(source[index + 1], g / sampleCount, strength), 0, 255);
      output[index + 2] = clamp(lerp(source[index + 2], b / sampleCount, strength), 0, 255);
    }
  }

  return output;
};

const applyChromaticAberration = (
  source: Uint8ClampedArray,
  width: number,
  height: number,
  params: TvEffectParams
): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(source);
  const strength = clamp(params.chromaticAberration, 0, 1);

  if (strength <= 0) return output;

  const redOffset = Math.round(params.redOffset);
  const blueOffset = Math.round(params.blueOffset);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = getIndex(x, y, width);
      const redIndex = getClampedIndex(x - redOffset, y, width, height);
      const blueIndex = getClampedIndex(x - blueOffset, y, width, height);

      output[index] = clamp(lerp(source[index], source[redIndex], strength), 0, 255);
      output[index + 1] = source[index + 1];
      output[index + 2] = clamp(lerp(source[index + 2], source[blueIndex + 2], strength), 0, 255);
    }
  }

  return output;
};

const applyBloom = (
  source: Uint8ClampedArray,
  width: number,
  height: number,
  params: TvEffectParams
): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(source);
  const strength = clamp(params.bloomStrength, 0, 0.5);
  const radius = Math.max(1, Math.round(params.bloomRadius));

  if (strength <= 0) return output;

  const bright = new Uint8ClampedArray(source.length);

  for (let i = 0; i < source.length; i += 4) {
    const luminance = source[i] * 0.2126 + source[i + 1] * 0.7152 + source[i + 2] * 0.0722;
    if (luminance >= params.bloomThreshold) {
      bright[i] = source[i];
      bright[i + 1] = source[i + 1];
      bright[i + 2] = source[i + 2];
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = getIndex(x, y, width);
      let r = 0;
      let g = 0;
      let b = 0;
      let sampleCount = 0;

      for (let offsetY = -radius; offsetY <= radius; offsetY++) {
        for (let offsetX = -radius; offsetX <= radius; offsetX++) {
          const sampleIndex = getClampedIndex(x + offsetX, y + offsetY, width, height);
          r += bright[sampleIndex];
          g += bright[sampleIndex + 1];
          b += bright[sampleIndex + 2];
          sampleCount++;
        }
      }

      output[index] = clamp(source[index] + (r / sampleCount) * strength, 0, 255);
      output[index + 1] = clamp(source[index + 1] + (g / sampleCount) * strength, 0, 255);
      output[index + 2] = clamp(source[index + 2] + (b / sampleCount) * strength, 0, 255);
    }
  }

  return output;
};

const applyScanline = (
  source: Uint8ClampedArray,
  width: number,
  height: number,
  params: TvEffectParams
): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(source);
  const strength = clamp(params.scanlineStrength, 0, 0.5);

  if (strength <= 0) return output;

  const frequency = Math.max(1, Math.round(params.scanlineFrequency));
  const thickness = Math.max(1, Math.round(params.scanlineThickness));

  for (let y = 0; y < height; y++) {
    const isDarkLine = y % frequency < thickness;
    if (!isDarkLine) continue;

    const multiplier = 1 - strength;
    for (let x = 0; x < width; x++) {
      const index = getIndex(x, y, width);
      output[index] = clamp(source[index] * multiplier, 0, 255);
      output[index + 1] = clamp(source[index + 1] * multiplier, 0, 255);
      output[index + 2] = clamp(source[index + 2] * multiplier, 0, 255);
    }
  }

  return output;
};

const applyColorAdjust = (source: Uint8ClampedArray, params: TvEffectParams): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(source);
  const gamma = Math.max(0.01, params.gamma);

  for (let i = 0; i < source.length; i += 4) {
    const luminance = source[i] * 0.2126 + source[i + 1] * 0.7152 + source[i + 2] * 0.0722;
    const saturatedR = luminance + (source[i] - luminance) * params.saturation;
    const saturatedG = luminance + (source[i + 1] - luminance) * params.saturation;
    const saturatedB = luminance + (source[i + 2] - luminance) * params.saturation;

    output[i] = adjustColorChannel(saturatedR, params, gamma);
    output[i + 1] = adjustColorChannel(saturatedG, params, gamma);
    output[i + 2] = adjustColorChannel(saturatedB, params, gamma);
  }

  return output;
};

const adjustColorChannel = (value: number, params: TvEffectParams, gamma: number): number => {
  const brightened = value * params.brightness;
  const contrasted = (brightened - 128) * params.contrast + 128;
  const normalized = clamp(contrasted, 0, 255) / 255;
  const gammaAdjusted = Math.pow(normalized, 1 / gamma) * 255;
  return clamp(gammaAdjusted * (1 - params.blackLevel) + 255 * params.blackLevel, 0, 255);
};

export const applyTvEffect = ({ ctx, width, height, options }: ApplyTvEffectOptions): void => {
  if (!options.enabled || width <= 0 || height <= 0) return;

  const params = resolveTvEffectParams(options);
  const imageData = ctx.getImageData(0, 0, width, height);
  const source = imageData.data;
  const bled = applyHorizontalBleed(source, width, height, params);
  const shifted = applyChromaticAberration(bled, width, height, params);
  const bloomed = applyBloom(shifted, width, height, params);
  const scanlined = applyScanline(bloomed, width, height, params);
  const adjusted = applyColorAdjust(scanlined, params);

  imageData.data.set(adjusted);
  ctx.putImageData(imageData, 0, 0);
};
