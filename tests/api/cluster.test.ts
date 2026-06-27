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

describe("cluster", () => {
  it("initializes clusters from the color distribution instead of raster order", () => {
    const grouped = [...repeatColor(red, 90), ...repeatColor(blue, 10)];
    const reordered = [...repeatColor(blue, 10), ...repeatColor(red, 90)];

    const groupedResult = cluster(grouped, 2);
    const reorderedResult = cluster(reordered, 2);

    expect(paletteKeys(groupedResult.mat)).toEqual(["0,0,255", "255,0,0"]);
    expect(paletteKeys(groupedResult.mat)).toEqual(paletteKeys(reorderedResult.mat));
  });
});
