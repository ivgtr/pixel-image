import type { CanvasRenderingContext2D } from "canvas";
import type { TvEffectParams } from "./types";

type PixelBufferInput = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  params: TvEffectParams;
};

type ApplyTvEffectInput = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  params: TvEffectParams;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const clampByte = (value: number): number => {
  return Math.round(clamp(value, 0, 255));
};

const pixelIndex = (x: number, y: number, width: number): number => {
  return (y * width + x) * 4;
};

const sampleIndex = (x: number, y: number, width: number, height: number): number => {
  return pixelIndex(
    Math.round(clamp(x, 0, width - 1)),
    Math.round(clamp(y, 0, height - 1)),
    width,
  );
};

export const applyHorizontalBleed = ({
  data,
  width,
  height,
  params,
}: PixelBufferInput): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data);
  const radius = Math.round(clamp(params.bleedRadius, 0, 24));
  const strength = clamp(params.bleedStrength || params.horizontalBleed, 0, 1);
  if (radius === 0 || strength === 0) return output;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = pixelIndex(x, y, width);
      let r = 0;
      let g = 0;
      let b = 0;
      let totalWeight = 0;

      for (let offsetX = -radius; offsetX <= radius; offsetX++) {
        const sample = sampleIndex(x + offsetX, y, width, height);
        const weight = 1 - Math.abs(offsetX) / (radius + 1);
        r += data[sample] * weight;
        g += data[sample + 1] * weight;
        b += data[sample + 2] * weight;
        totalWeight += weight;
      }

      output[index] = clampByte(data[index] * (1 - strength) + (r / totalWeight) * strength);
      output[index + 1] = clampByte(
        data[index + 1] * (1 - strength) + (g / totalWeight) * strength,
      );
      output[index + 2] = clampByte(
        data[index + 2] * (1 - strength) + (b / totalWeight) * strength,
      );
      output[index + 3] = data[index + 3];
    }
  }

  return output;
};

export const applyChromaticAberration = ({
  data,
  width,
  height,
  params,
}: PixelBufferInput): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data);
  const strength = clamp(params.chromaticAberration, 0, 1);
  if (strength === 0) return output;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = pixelIndex(x, y, width);
      const redIndex = sampleIndex(x - params.redOffset, y, width, height);
      const blueIndex = sampleIndex(x - params.blueOffset, y, width, height);

      output[index] = clampByte(data[index] * (1 - strength) + data[redIndex] * strength);
      output[index + 1] = data[index + 1];
      output[index + 2] = clampByte(
        data[index + 2] * (1 - strength) + data[blueIndex + 2] * strength,
      );
      output[index + 3] = data[index + 3];
    }
  }

  return output;
};

export const applyBloom = ({
  data,
  width,
  height,
  params,
}: PixelBufferInput): Uint8ClampedArray => {
  const strength = clamp(params.bloomStrength, 0, 0.5);
  const radius = Math.round(clamp(params.bloomRadius, 0, 6));
  if (strength === 0 || radius === 0) return new Uint8ClampedArray(data);

  const bright = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = pixelIndex(x, y, width);
      const luminance = data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
      if (luminance >= params.bloomThreshold) {
        bright[index] = data[index];
        bright[index + 1] = data[index + 1];
        bright[index + 2] = data[index + 2];
      }
      bright[index + 3] = data[index + 3];
    }
  }

  const blurred = new Uint8ClampedArray(bright.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = pixelIndex(x, y, width);
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let offsetY = -radius; offsetY <= radius; offsetY++) {
        for (let offsetX = -radius; offsetX <= radius; offsetX++) {
          const sample = sampleIndex(x + offsetX, y + offsetY, width, height);
          r += bright[sample];
          g += bright[sample + 1];
          b += bright[sample + 2];
          count++;
        }
      }

      blurred[index] = clampByte(r / count);
      blurred[index + 1] = clampByte(g / count);
      blurred[index + 2] = clampByte(b / count);
      blurred[index + 3] = data[index + 3];
    }
  }

  const output = new Uint8ClampedArray(data);
  for (let index = 0; index < data.length; index += 4) {
    output[index] = clampByte(data[index] + blurred[index] * strength);
    output[index + 1] = clampByte(data[index + 1] + blurred[index + 1] * strength);
    output[index + 2] = clampByte(data[index + 2] + blurred[index + 2] * strength);
    output[index + 3] = data[index + 3];
  }

  return output;
};

export const applyScanline = ({
  data,
  width,
  height,
  params,
}: PixelBufferInput): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data);
  const strength = clamp(params.scanlineStrength, 0, 0.5);
  const frequency = Math.max(1, Math.round(params.scanlineFrequency));
  const thickness = Math.max(1, Math.round(params.scanlineThickness));
  if (strength === 0) return output;

  for (let y = 0; y < height; y++) {
    if (y % frequency >= thickness) continue;
    const multiplier = 1 - strength;
    for (let x = 0; x < width; x++) {
      const index = pixelIndex(x, y, width);
      output[index] = clampByte(data[index] * multiplier);
      output[index + 1] = clampByte(data[index + 1] * multiplier);
      output[index + 2] = clampByte(data[index + 2] * multiplier);
      output[index + 3] = data[index + 3];
    }
  }

  return output;
};

export const applyColorAdjust = ({
  data,
  params,
}: PixelBufferInput): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data);
  const saturation = clamp(params.saturation, 0, 2);
  const contrast = clamp(params.contrast, 0.5, 2);
  const gamma = clamp(params.gamma, 0.5, 2.5);
  const brightness = clamp(params.brightness, 0.5, 1.5);
  const blackLevel = clamp(params.blackLevel, 0, 0.2);

  for (let index = 0; index < data.length; index += 4) {
    const luminance = data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
    const adjusted = [data[index], data[index + 1], data[index + 2]].map((channel) => {
      let value = luminance + (channel - luminance) * saturation;
      value = (value - 128) * contrast + 128;
      value *= brightness;
      value = (value - blackLevel * 255) / (1 - blackLevel);
      value = 255 * Math.pow(clamp(value, 0, 255) / 255, 1 / gamma);
      return clampByte(value);
    });

    output[index] = adjusted[0];
    output[index + 1] = adjusted[1];
    output[index + 2] = adjusted[2];
    output[index + 3] = data[index + 3];
  }

  return output;
};

export const applyTvEffectToBuffer = ({
  data,
  width,
  height,
  params,
}: PixelBufferInput): Uint8ClampedArray => {
  const bled = applyHorizontalBleed({ data, width, height, params });
  const shifted = applyChromaticAberration({ data: bled, width, height, params });
  const bloomed = applyBloom({ data: shifted, width, height, params });
  const scanlined = applyScanline({ data: bloomed, width, height, params });
  return applyColorAdjust({ data: scanlined, width, height, params });
};

export const applyTvEffect = ({ ctx, width, height, params }: ApplyTvEffectInput): void => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const output = applyTvEffectToBuffer({
    data: imageData.data,
    width,
    height,
    params,
  });
  const adjustedImageData = ctx.createImageData(width, height);
  adjustedImageData.data.set(output);
  ctx.putImageData(adjustedImageData, 0, 0);
};
