import { describe, expect, it } from "vitest";
import { parsePostRequest } from "../../src/server/pixelImage/parser";

const requestWithBody = (body: Record<string, unknown>) => {
  return { body } as Parameters<typeof parsePostRequest>[0];
};

const pngDataUrl = `data:image/png;base64,${Buffer.from([1, 2, 3]).toString("base64")}`;

describe("parsePostRequest", () => {
  it("parses uploaded image defaults", () => {
    expect(parsePostRequest(requestWithBody({ imageDataUrl: pngDataUrl, type: "png" }))).toEqual(
      expect.objectContaining({
        image: "local-upload",
        imageDataUrl: pngDataUrl,
        type: "png",
        size: 15,
        sampleSize: 15,
        pixelSize: 15,
        k: 8,
        tvEffect: expect.objectContaining({ enabled: false }),
      }),
    );
  });

  it("parses uploaded conversion settings", () => {
    expect(
      parsePostRequest(
        requestWithBody({
          imageDataUrl: pngDataUrl,
          type: "jpeg",
          sampleSize: "8",
          pixelSize: "16",
          k: "12",
          tv: "1",
          tvPreset: "crt",
          tvStrength: "80",
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        type: "jpeg",
        sampleSize: 8,
        pixelSize: 16,
        k: 12,
        tvEffect: expect.objectContaining({ enabled: true, preset: "crt", strength: 80 }),
      }),
    );
  });

  it("rejects invalid uploaded request bodies", () => {
    expect(() => parsePostRequest({ body: undefined } as Parameters<typeof parsePostRequest>[0])).toThrow(
      "request body must be a JSON object",
    );
    expect(() => parsePostRequest(requestWithBody({ type: "png" }))).toThrow(
      "imageDataUrl is required",
    );
    expect(() =>
      parsePostRequest(requestWithBody({ imageDataUrl: pngDataUrl, type: "gif" })),
    ).toThrow("type must be jpeg or png");
    expect(() =>
      parsePostRequest(requestWithBody({ imageDataUrl: pngDataUrl, type: "png", sampleSize: "0" })),
    ).toThrow("sampleSize must be between 1 and 50");
  });
});
