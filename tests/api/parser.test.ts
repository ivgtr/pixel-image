import { describe, expect, it } from "vitest";
import { parseRequest } from "../../src/server/pixelImage/parser";

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
});
