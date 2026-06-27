import { createCanvas, loadImage } from "canvas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeImage } from "../../src/server/pixelImage/analyzer";
import { createImage } from "../../src/server/pixelImage/createImage";
import { createTvEffectOptions } from "../../src/server/pixelImage/tvEffect/presets";

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
  k = 2,
  tv = false,
}: {
  size: number;
  k?: number;
  tv?: boolean;
}) => ({
  image: "https://example.com/image.png",
  type: "png" as const,
  size,
  k,
  tvEffect: createTvEffectOptions({ enabled: tv }),
});

describe("createImage", () => {
  beforeEach(() => {
    mockAnalyzeImage.mockReset();
  });

  it("keeps square output dimensions", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 20) });

    const buffer = await createImage(createOptions({ size: 10 }));
    const image = await loadImage(buffer as Buffer);

    expect(image.width).toBe(20);
    expect(image.height).toBe(20);
  });

  it("keeps horizontal output dimensions", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(40, 20) });

    const buffer = await createImage(createOptions({ size: 10 }));
    const image = await loadImage(buffer as Buffer);

    expect(image.width).toBe(40);
    expect(image.height).toBe(20);
  });

  it("keeps vertical output dimensions", async () => {
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

  it("is deterministic for the same input", async () => {
    mockAnalyzeImage.mockResolvedValue({ imageBuffer: createMockImageBuffer(20, 20) });

    const first = await createImage(createOptions({ size: 10, k: 2 }));
    const second = await createImage(createOptions({ size: 10, k: 2 }));

    expect(Buffer.compare(first as Buffer, second as Buffer)).toBe(0);
  });
});
