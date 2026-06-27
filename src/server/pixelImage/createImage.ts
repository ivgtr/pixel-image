import { createCanvas, loadImage } from "canvas";
import { analyzeImage } from "./analyzer";
import { cluster } from "./cluster";
import type { ParsedOptions } from "./parser";
import { applyTvEffect } from "./tvEffect/applyTvEffect";

const cellSize = (a: number, b: number, size: number): [number, number] => {
  const rA = Math.ceil(a / size);
  const rB = Math.ceil(b / size);

  return [rA, rB];
};

export const createImage = async ({
  image,
  size,
  k,
  ...options
}: ParsedOptions): Promise<string | Buffer> => {
  // 画像のデータを取得
  const { imageBuffer } = await analyzeImage(image);
  const img = await loadImage(imageBuffer);
  const { width, height } = img;

  // オリジナル画像描画用のキャンバスを作成
  const imageCanvas = createCanvas(width, height);
  const imageCtx = imageCanvas.getContext("2d");

  // オリジナル画像を描画
  imageCtx.drawImage(img, 0, 0, width, height);

  // 分割サイズを計算
  const [rWidth, rHeight] = cellSize(width, height, size);

  // ピクセル化後の画像描画用のキャンバスを作成
  const pixelCanvas = createCanvas(rWidth * size, rHeight * size);
  const pixelCtx = pixelCanvas.getContext("2d");

  // RGBを格納する配列を作成
  const rgbArray = [...Array(rWidth * rHeight)].map(() => [0, 0, 0]);

  for (let i = 0; i < rWidth; i++) {
    for (let j = 0; j < rHeight; j++) {
      const cellWidth = Math.min(size, width - i * size);
      const cellHeight = Math.min(size, height - j * size);
      const cell = imageCtx.getImageData(i * size, j * size, cellWidth, cellHeight);
      const cellData = cell.data;
      let avgR = 0;
      let avgG = 0;
      let avgB = 0;
      let count = 0;

      for (let k = 0; k < cellData.length; k += 4) {
        avgR += cellData[k];
        avgG += cellData[k + 1];
        avgB += cellData[k + 2];
        count++;
      }

      rgbArray[i + j * rWidth] = [
        Math.round(avgR / count),
        Math.round(avgG / count),
        Math.round(avgB / count),
      ];
    }
  }

  const { clusters, mat } = cluster(rgbArray, k);
  clusters.forEach((cluster, index) => {
    rgbArray[index] = mat[cluster];
  });

  for (let i = 0; i < rWidth; i++) {
    for (let j = 0; j < rHeight; j++) {
      const [r, g, b] = rgbArray[i + j * rWidth];
      pixelCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      pixelCtx.fillRect(i * size, j * size, size, size);
    }
  }

  if (options.tvEffect.enabled) {
    applyTvEffect({
      ctx: pixelCtx,
      width: pixelCanvas.width,
      height: pixelCanvas.height,
      params: options.tvEffect.params,
    });
  }

  let buffer: Buffer;
  if (options.type === "jpeg") {
    buffer = await pixelCanvas.toBuffer("image/jpeg");
  } else {
    buffer = await pixelCanvas.toBuffer("image/png");
  }

  return buffer;
};
