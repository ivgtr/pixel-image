import { describe, expect, it } from "vitest";
import { analyzeUploadedImage } from "../../src/server/pixelImage/analyzer";

const dataUrl = (mime: string, buffer: Buffer): string => {
  return `data:${mime};base64,${buffer.toString("base64")}`;
};

describe("analyzeUploadedImage", () => {
  it("accepts PNG data URLs", () => {
    const buffer = Buffer.from([1, 2, 3]);
    expect(analyzeUploadedImage(dataUrl("image/png", buffer))).toEqual({
      imageBuffer: buffer,
      type: "png",
    });
  });

  it("accepts JPEG data URLs", () => {
    const buffer = Buffer.from([4, 5, 6]);
    expect(analyzeUploadedImage(dataUrl("image/jpeg", buffer))).toEqual({
      imageBuffer: buffer,
      type: "jpeg",
    });
  });

  it("rejects malformed data URLs", () => {
    expect(() => analyzeUploadedImage("https://example.com/image.png")).toThrow(
      "image data URL must be base64 encoded",
    );
    expect(() => analyzeUploadedImage("data:image/png;base64,***")).toThrow(
      "image data URL must be base64 encoded",
    );
  });

  it("rejects unsupported MIME types", () => {
    expect(() => analyzeUploadedImage(dataUrl("image/gif", Buffer.from([1, 2, 3])))).toThrow(
      "image must be jpeg or png",
    );
  });

  it("rejects oversized uploads", () => {
    expect(() => analyzeUploadedImage(dataUrl("image/png", Buffer.alloc(5 * 1024 * 1024 + 1)))).toThrow(
      "image is too large",
    );
  });
});
