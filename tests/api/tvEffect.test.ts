import { describe, expect, it } from "vitest";
import {
  applyChromaticAberration,
  applyColorAdjust,
  applyHorizontalBleed,
  applyScanline,
  applyTvEffectToBuffer,
} from "../../src/server/pixelImage/tvEffect/applyTvEffect";
import { createTvEffectOptions, resolveTvEffectParams } from "../../src/server/pixelImage/tvEffect/presets";
import type { TvEffectParams } from "../../src/server/pixelImage/tvEffect/types";

const baseParams: TvEffectParams = {
  horizontalBleed: 0,
  bleedRadius: 1,
  bleedStrength: 0,
  chromaticAberration: 0,
  redOffset: 1,
  blueOffset: -1,
  scanlineStrength: 0,
  scanlineFrequency: 2,
  scanlineThickness: 1,
  bloomStrength: 0,
  bloomThreshold: 255,
  bloomRadius: 1,
  saturation: 1,
  contrast: 1,
  gamma: 1,
  brightness: 1,
  blackLevel: 0,
};

describe("tvEffect presets", () => {
  it("applies strength to effect intensities", () => {
    const params = resolveTvEffectParams("soft-tv", 50);

    expect(params.horizontalBleed).toBeCloseTo(0.175);
    expect(params.chromaticAberration).toBeCloseTo(0.06);
    expect(params.scanlineStrength).toBeCloseTo(0.05);
    expect(params.saturation).toBeCloseTo(1.04);
  });

  it("scales display-space radii by cell size", () => {
    const small = resolveTvEffectParams("ntsc", 80, 1);
    const large = resolveTvEffectParams("ntsc", 80, 15);

    expect(large.bleedRadius).toBeGreaterThan(small.bleedRadius);
    expect(large.bloomRadius).toBeGreaterThanOrEqual(small.bloomRadius);
  });

  it("creates disabled options by default", () => {
    expect(createTvEffectOptions()).toEqual(
      expect.objectContaining({
        enabled: false,
        preset: "soft-tv",
        strength: 60,
      }),
    );
  });
});

describe("tvEffect image operations", () => {
  it("bleeds horizontally without mixing vertical neighbors", () => {
    const data = new Uint8ClampedArray([
      0, 0, 0, 255, 100, 0, 0, 255, 200, 0, 0, 255,
      0, 200, 0, 255, 100, 200, 0, 255, 200, 200, 0, 255,
    ]);

    const output = applyHorizontalBleed({
      data,
      width: 3,
      height: 2,
      params: { ...baseParams, bleedStrength: 0.5 },
    });

    expect(output[4]).toBe(100);
    expect(output[5]).toBe(0);
    expect(output[16]).toBe(100);
    expect(output[17]).toBe(200);
  });

  it("shifts red and blue channels by configured offsets", () => {
    const data = new Uint8ClampedArray([
      10, 0, 100, 255, 20, 0, 150, 255, 30, 0, 200, 255,
    ]);

    const output = applyChromaticAberration({
      data,
      width: 3,
      height: 1,
      params: { ...baseParams, chromaticAberration: 1, redOffset: 1, blueOffset: -1 },
    });

    expect(output[4]).toBe(10);
    expect(output[6]).toBe(200);
  });

  it("darkens scanline rows by frequency and thickness", () => {
    const data = new Uint8ClampedArray([
      100, 100, 100, 255,
      100, 100, 100, 255,
      100, 100, 100, 255,
    ]);

    const output = applyScanline({
      data,
      width: 1,
      height: 3,
      params: { ...baseParams, scanlineStrength: 0.25, scanlineFrequency: 2 },
    });

    expect(output[0]).toBe(75);
    expect(output[4]).toBe(100);
    expect(output[8]).toBe(75);
  });

  it("keeps color adjustment values in byte range and preserves alpha", () => {
    const data = new Uint8ClampedArray([250, 240, 230, 123]);

    const output = applyColorAdjust({
      data,
      width: 1,
      height: 1,
      params: { ...baseParams, saturation: 2, contrast: 2, brightness: 1.5 },
    });

    expect(output[0]).toBeLessThanOrEqual(255);
    expect(output[1]).toBeLessThanOrEqual(255);
    expect(output[2]).toBeLessThanOrEqual(255);
    expect(output[3]).toBe(123);
  });

  it("runs the full pipeline without changing buffer length", () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]);

    const output = applyTvEffectToBuffer({
      data,
      width: 2,
      height: 1,
      params: resolveTvEffectParams("soft-tv", 60),
    });

    expect(output).toHaveLength(data.length);
  });
});
