import { createCanvas, loadImage } from "canvas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeImage } from "../../src/server/pixelImage/analyzer";
import { createImage, createImageFromBuffer } from "../../src/server/pixelImage/createImage";
import type { ParsedOptions } from "../../src/server/pixelImage/parser";
import { createTvEffectOptions } from "../../src/server/pixelImage/tvEffect/presets";
import type { TvEffectPreset } from "../../src/server/pixelImage/tvEffect/types";

vi.mock("../../src/server/pixelImage/analyzer", () => ({
  analyzeImage: vi.fn(),
}));

const mockAnalyzeImage = vi.mocked(analyzeImage);

const createSourcePng = (width: number, height: number): Buffer => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgb(255, 0, 0)";
  ctx.fillRect(0, 0, width / 2, height);
  ctx.fillStyle = "rgb(0, 0, 255)";
  ctx.fillRect(width / 2, 0, width / 2, height);

  return canvas.toBuffer("image/png");
};

const createMockImageBuffer = (width: number, height: number): Buffer<ArrayBuffer> => {
  return Buffer.from(createSourcePng(width, height));
};

const createOptions = ({
  size,
  sampleSize = size,
  pixelSize = size,
  k = 2,
  tv = false,
  preset = "soft-tv",
}: {
  size: number;
  sampleSize?: number;
  pixelSize?: number;
  k?: number;
  tv?: boolean;
  preset?: TvEffectPreset;
}): ParsedOptions => ({
  image: "https://example.com/image.png",
  type: "png" as const,
  size,
  sampleSize,
  pixelSize,
  k,
  tvEffect: createTvEffectOptions({ enabled: tv, preset, cellSize: pixelSize }),
});

describe("createImage", () => {
  beforeEach(() => {
    mockAnalyzeImage.mockReset();
  });

  it("keeps square output dimensions for size compatibility", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 20) });

    const buffer = await createImage(createOptions({ size: 10 }));
    const image = await loadImage(buffer as Buffer);

    expect(image.width).toBe(20);
    expect(image.height).toBe(20);
  });

  it("keeps horizontal output dimensions for size compatibility", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(40, 20) });

    const buffer = await createImage(createOptions({ size: 10 }));
    const image = await loadImage(buffer as Buffer);

    expect(image.width).toBe(40);
    expect(image.height).toBe(20);
  });

  it("keeps vertical output dimensions for size compatibility", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 40) });

    const buffer = await createImage(createOptions({ size: 10 }));
    const image = await loadImage(buffer as Buffer);

    expect(image.width).toBe(20);
    expect(image.height).toBe(40);
  });

  it("keeps small images visible when size is larger than the source", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(6, 4) });

    const buffer = await createImage(createOptions({ size: 10 }));
    const image = await loadImage(buffer as Buffer);

    expect(image.width).toBe(10);
    expect(image.height).toBe(10);
  });

  it("uses pixelSize for output dimensions when sampleSize is separated", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 20) });

    const buffer = await createImage(createOptions({ size: 10, sampleSize: 10, pixelSize: 5 }));
    const image = await loadImage(buffer as Buffer);

    expect(image.width).toBe(10);
    expect(image.height).toBe(10);
  });

  it("is deterministic for the same input", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 20) });

    const first = await createImage(createOptions({ size: 10, k: 2 }));
    const second = await createImage(createOptions({ size: 10, k: 2 }));

    expect(Buffer.compare(first as Buffer, second as Buffer)).toBe(0);
  });

  it("is deterministic when sampleSize and pixelSize are separated", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 20) });

    const options = { size: 10, sampleSize: 10, pixelSize: 5, k: 2 };
    const first = await createImage(createOptions(options));
    const second = await createImage(createOptions(options));

    expect(Buffer.compare(first as Buffer, second as Buffer)).toBe(0);
  });

  it("creates an image from an uploaded image buffer", async () => {
    const buffer = await createImageFromBuffer(
      createMockImageBuffer(20, 20),
      createOptions({ size: 10 }),
    );
    const image = await loadImage(buffer as Buffer);

    expect(image.width).toBe(20);
    expect(image.height).toBe(20);
    expect(mockAnalyzeImage).not.toHaveBeenCalled();
  });

  it("is deterministic when size is 1", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 20) });

    const first = await createImage(createOptions({ size: 1, k: 2 }));
    const second = await createImage(createOptions({ size: 1, k: 2 }));

    expect(Buffer.compare(first as Buffer, second as Buffer)).toBe(0);
  });

  it("ignores tv effect preset when tv effect is disabled", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 20) });

    const softTv = await createImage(createOptions({ size: 10, tv: false, preset: "soft-tv" }));
    const crt = await createImage(createOptions({ size: 10, tv: false, preset: "crt" }));

    expect(Buffer.compare(softTv as Buffer, crt as Buffer)).toBe(0);
  });
});
