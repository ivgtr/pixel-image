import { describe, expect, it } from "vitest";
import { cluster } from "../../src/server/pixelImage/cluster";

const red = [255, 0, 0];
const blue = [0, 0, 255];

const repeatColor = (color: number[], count: number) => {
  return [...Array(count)].map(() => [...color]);
};

const paletteKeys = (palette: number[][]) => {
  return palette.map((color) => color.join(",")).sort();
};

const hasOnlyValidClusterReferences = ({
  clusters,
  mat,
}: {
  clusters: number[];
  mat: number[][];
}) => {
  return clusters.every(
    (clusterIndex) => clusterIndex >= 0 && clusterIndex < mat.length,
  );
};

describe("cluster", () => {
  it("initializes clusters from the color distribution instead of raster order", () => {
    const grouped = [...repeatColor(red, 90), ...repeatColor(blue, 10)];
    const reordered = [...repeatColor(blue, 10), ...repeatColor(red, 90)];

    const groupedResult = cluster(grouped, 2);
    const reorderedResult = cluster(reordered, 2);

    expect(paletteKeys(groupedResult.mat)).toEqual(["0,0,255", "255,0,0"]);
    expect(paletteKeys(groupedResult.mat)).toEqual(
      paletteKeys(reorderedResult.mat),
    );
  });

  it("caps the palette to the unique color count", () => {
    const result = cluster([red, blue], 8);

    expect(result.mat).toHaveLength(2);
    expect(paletteKeys(result.mat)).toEqual(["0,0,255", "255,0,0"]);
    expect(hasOnlyValidClusterReferences(result)).toBe(true);
  });

  it("uses duplicate color counts when updating centroids", () => {
    const result = cluster(
      [...repeatColor(red, 90), ...repeatColor(blue, 10)],
      1,
    );

    expect(result.mat).toEqual([[230, 0, 26]]);
    expect(result.mat).not.toEqual([[128, 0, 128]]);
    expect(hasOnlyValidClusterReferences(result)).toBe(true);
  });

  it("rejects malformed RGB colors instead of coercing them", () => {
    expect(() => cluster([[255, 0]], 1)).toThrow("RGB tuple");
    expect(() => cluster([[255, 0, Number.NaN]], 1)).toThrow(
      "RGB tuple",
    );
  });

  it("rejects invalid cluster sizes instead of returning unusable clusters", () => {
    expect(() => cluster([red], 0)).toThrow("positive integer");
    expect(() => cluster([red], 1.5)).toThrow("positive integer");
  });
});
