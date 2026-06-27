import { describe, expect, it } from "vitest";
import { parseRequest } from "../../src/server/pixelImage/parser";
import { DEFAULT_TV_EFFECT_STRENGTH } from "../../src/server/pixelImage/tvEffect/types";

const requestWithQuery = (query: Record<string, string | string[] | undefined>) => {
  return { query } as Parameters<typeof parseRequest>[0];
};

describe("parseRequest", () => {
  it("parses defaults", () => {
    expect(parseRequest(requestWithQuery({ image: "https://example.com/image.png" }))).toEqual({
      image: "https://example.com/image.png",
      type: "jpeg",
      size: 15,
      k: 8,
      tvEffect: expect.objectContaining({
        enabled: false,
        preset: "soft-tv",
        strength: DEFAULT_TV_EFFECT_STRENGTH,
      }),
    });
  });

  it("rejects invalid query shapes", () => {
    expect(() => parseRequest(requestWithQuery({ image: undefined }))).toThrow("image is required");
    expect(() => parseRequest(requestWithQuery({ image: ["a", "b"] }))).toThrow(
      "must not be array",
    );
  });

  it("validates output type", () => {
    expect(() =>
      parseRequest(requestWithQuery({ image: "https://example.com/image.png", type: "gif" })),
    ).toThrow("type must be jpeg or png");
  });

  it("validates numeric boundaries", () => {
    expect(() =>
      parseRequest(requestWithQuery({ image: "https://example.com/image.png", size: "0" })),
    ).toThrow("size must be between 1 and 50");
    expect(() =>
      parseRequest(requestWithQuery({ image: "https://example.com/image.png", k: "51" })),
    ).toThrow("k must be between 1 and 50");
    expect(() =>
      parseRequest(requestWithQuery({ image: "https://example.com/image.png", k: "1.5" })),
    ).toThrow("k must be an integer");
  });

  it("parses tv effect options", () => {
    expect(
      parseRequest(
        requestWithQuery({
          image: "https://example.com/image.png",
          tv: "1",
          tvPreset: "crt",
          tvStrength: "80",
        }),
      ),
    ).toEqual({
      image: "https://example.com/image.png",
      type: "jpeg",
      size: 15,
      k: 8,
      tvEffect: expect.objectContaining({
        enabled: true,
        preset: "crt",
        strength: 80,
      }),
    });
  });

  it("validates tv effect query values", () => {
    expect(() =>
      parseRequest(requestWithQuery({ image: "https://example.com/image.png", tv: "yes" })),
    ).toThrow("tv must be 0 or 1");
    expect(() =>
      parseRequest(
        requestWithQuery({
          image: "https://example.com/image.png",
          tv: "1",
          tvPreset: "warm-tv",
        }),
      ),
    ).toThrow("tvPreset must be soft-tv");
    expect(() =>
      parseRequest(
        requestWithQuery({
          image: "https://example.com/image.png",
          tv: "1",
          tvStrength: "101",
        }),
      ),
    ).toThrow("tvStrength must be between 0 and 100");
  });

  it("ignores tv effect preset and strength when tv is disabled", () => {
    expect(
      parseRequest(
        requestWithQuery({
          image: "https://example.com/image.png",
          tv: "0",
          tvPreset: "crt",
          tvStrength: "100",
        }),
      ).tvEffect,
    ).toEqual(
      expect.objectContaining({
        enabled: false,
        preset: "soft-tv",
        strength: DEFAULT_TV_EFFECT_STRENGTH,
      }),
    );
  });
});
