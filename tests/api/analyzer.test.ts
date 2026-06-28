import { lookup } from "node:dns/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  analyzeImage,
  analyzeUploadedImage,
  isBlockedAddress,
} from "../../src/server/pixelImage/analyzer";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(),
}));

const mockLookup = vi.mocked(lookup);
const publicLookupResult = [{ address: "93.184.216.34", family: 4 }] as unknown as Awaited<
  ReturnType<typeof lookup>
>;

describe("isBlockedAddress", () => {
  it("blocks local and private address ranges", () => {
    expect(isBlockedAddress("127.0.0.1")).toBe(true);
    expect(isBlockedAddress("10.0.0.1")).toBe(true);
    expect(isBlockedAddress("172.16.0.1")).toBe(true);
    expect(isBlockedAddress("192.168.0.1")).toBe(true);
    expect(isBlockedAddress("169.254.169.254")).toBe(true);
    expect(isBlockedAddress("::1")).toBe(true);
    expect(isBlockedAddress("::ffff:10.0.0.1")).toBe(true);
    expect(isBlockedAddress("::ffff:100.64.0.1")).toBe(true);
    expect(isBlockedAddress("::ffff:172.16.0.1")).toBe(true);
    expect(isBlockedAddress("::ffff:192.168.0.1")).toBe(true);
  });

  it("allows public addresses", () => {
    expect(isBlockedAddress("8.8.8.8")).toBe(false);
    expect(isBlockedAddress("::ffff:8.8.8.8")).toBe(false);
    expect(isBlockedAddress("2001:4860:4860::8888")).toBe(false);
  });
});

describe("analyzeImage", () => {
  beforeEach(() => {
    mockLookup.mockResolvedValue(publicLookupResult);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(new Uint8Array([1, 2, 3]), {
            headers: { "content-type": "image/png" },
            status: 200,
          }),
        ),
      ),
    );
  });

  it("rejects unsupported protocols", async () => {
    await expect(analyzeImage("file:///etc/passwd")).rejects.toThrow(
      "image URL must use http or https",
    );
  });

  it("rejects private IP literals", async () => {
    await expect(analyzeImage("http://127.0.0.1/image.png")).rejects.toThrow(
      "image URL must not resolve to a private address",
    );
  });

  it("rejects unsupported content types", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "image/gif" },
        status: 200,
      }),
    );

    await expect(analyzeImage("https://example.com/image.gif")).rejects.toThrow(
      "image must be jpeg or png",
    );
  });

  it("rejects oversized images by content-length", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, {
        headers: { "content-length": String(5 * 1024 * 1024 + 1), "content-type": "image/png" },
        status: 200,
      }),
    );

    await expect(analyzeImage("https://example.com/image.png")).rejects.toThrow(
      "image is too large",
    );
  });

  it("returns the image buffer", async () => {
    await expect(analyzeImage("https://example.com/image.png")).resolves.toEqual({
      imageBuffer: Buffer.from([1, 2, 3]),
    });
  });
});

describe("analyzeUploadedImage", () => {
  it("accepts png and jpeg data URLs", () => {
    expect(analyzeUploadedImage("data:image/png;base64,AQID")).toEqual({
      imageBuffer: Buffer.from([1, 2, 3]),
    });
    expect(analyzeUploadedImage("data:image/jpeg;base64,AQID")).toEqual({
      imageBuffer: Buffer.from([1, 2, 3]),
    });
  });

  it("rejects invalid data URLs", () => {
    expect(() => analyzeUploadedImage("https://example.com/image.png")).toThrow(
      "imageDataUrl must be a PNG or JPEG data URL",
    );
    expect(() => analyzeUploadedImage("data:image/gif;base64,AQID")).toThrow(
      "imageDataUrl must be a PNG or JPEG data URL",
    );
  });

  it("rejects oversized upload images", () => {
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64");

    expect(() => analyzeUploadedImage(`data:image/png;base64,${oversized}`)).toThrow(
      "image is too large",
    );
  });
});
