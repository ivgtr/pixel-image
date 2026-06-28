import { describe, expect, it } from "vitest";
import {
  buildApiUrl,
  defaultSettings,
  estimateOutputScale,
  resolveUiMode,
} from "../../src/components/organisms/PixelImageStudio/types";

describe("PixelImageStudio utilities", () => {
  it("resolves UI mode with lab fallback", () => {
    expect(resolveUiMode("lab")).toBe("lab");
    expect(resolveUiMode("arcade")).toBe("arcade");
    expect(resolveUiMode("gallery")).toBe("gallery");
    expect(resolveUiMode("artifact")).toBe("artifact");
    expect(resolveUiMode("unknown")).toBe("lab");
    expect(resolveUiMode(undefined)).toBe("lab");
  });

  it("builds a shareable API URL for URL input", () => {
    const url = buildApiUrl({
      origin: "https://pixel-image.example",
      imageUrl: "https://example.com/source.png",
      settings: {
        ...defaultSettings,
        sampleSize: "10",
        pixelSize: "20",
        paletteSize: "6",
        tvEffectEnabled: true,
        tvEffectPreset: "crt",
        tvEffectStrength: "80",
      },
    });

    expect(url).toBe(
      "https://pixel-image.example/api?image=https%3A%2F%2Fexample.com%2Fsource.png&sampleSize=10&pixelSize=20&k=6&tv=1&tvPreset=crt&tvStrength=80",
    );
  });

  it("estimates output scale from sample and pixel size", () => {
    expect(estimateOutputScale({ ...defaultSettings, sampleSize: "10", pixelSize: "20" })).toBe(
      "2.00x",
    );
  });
});
