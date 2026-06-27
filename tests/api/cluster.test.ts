import { describe, expect, it } from "vitest";
import { cluster } from "../../src/server/pixelImage/cluster";

const red = [255, 0, 0];
const blue = [0, 0, 255];

const repeatColor = (color: number[], count: number) => {
  return [...Array(count)].map(() => [...color]);
};

const squaredDistance = (a: number[], b: number[]) => {
  const r = a[0] - b[0];
  const g = a[1] - b[1];
  const bDiff = a[2] - b[2];

  return r * r + g * g + bDiff * bDiff;
};

const hasNearbyColor = (
  palette: number[][],
  color: number[],
  maxDistance: number,
) => {
  return palette.some(
    (candidate) => squaredDistance(candidate, color) <= maxDistance,
  );
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

  it("localizes palette changes when the requested palette size grows", () => {
    const data = [
      ...repeatColor([255, 0, 0], 40),
      ...repeatColor([0, 255, 0], 30),
      ...repeatColor([0, 0, 255], 20),
      ...repeatColor([255, 255, 0], 10),
      ...repeatColor([255, 128, 0], 10),
    ];

    const smallerPalette = cluster(data, 3).mat;
    const largerPalette = cluster(data, 4).mat;

    expect(largerPalette).toHaveLength(4);
    smallerPalette.forEach((color) => {
      expect(hasNearbyColor(largerPalette, color, 5_000)).toBe(true);
    });
  });

  it("splits the cluster with the largest weighted SSE first", () => {
    const stableGreen = [0, 255, 0];
    const data = [
      ...repeatColor(stableGreen, 300),
      ...repeatColor([255, 0, 0], 50),
      ...repeatColor([255, 128, 0], 50),
      ...repeatColor([255, 255, 0], 50),
    ];

    const twoColorPalette = cluster(data, 2).mat;
    const threeColorPalette = cluster(data, 3).mat;
    const redYellowClusterCount = (palette: number[][]) => {
      return palette.filter(([r]) => r === 255).length;
    };

    expect(hasNearbyColor(twoColorPalette, stableGreen, 0)).toBe(true);
    expect(hasNearbyColor(threeColorPalette, stableGreen, 0)).toBe(true);
    expect(redYellowClusterCount(twoColorPalette)).toBe(1);
    expect(redYellowClusterCount(threeColorPalette)).toBe(2);
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
    expect(() => cluster([[255, 0, 0, 0]], 1)).toThrow("RGB tuple");
    expect(() => cluster([[255, 0, Number.NaN]], 1)).toThrow("RGB tuple");
  });

  it("rejects invalid cluster sizes instead of returning unusable clusters", () => {
    expect(() => cluster([red], 0)).toThrow("positive integer");
    expect(() => cluster([red], 1.5)).toThrow("positive integer");
    expect(() => cluster([red], Number.NaN)).toThrow("positive integer");
  });
});
