import { createCanvas, Image } from "canvas";
import { analyzeImage } from "./analyzer";
import { cluster } from "./cluster";
import type { ParsedOptions } from "./parser";

const cellSize = (a: number, b: number, size: number): number[] => {
  const rA = (a / size) | 0;
  const rB = (b / size) | 0;

  return [rA, rB];
};

export const createImage = async ({
  image,
  size,
  k,
  ...options
}: ParsedOptions): Promise<string | Buffer> => {
  // 画像のデータを取得
  const { base64Image, width, height } = await analyzeImage(image);

  if (!base64Image) throw new Error("image is not valid");
  if (!width) throw new Error("image width is not valid");
  if (!height) throw new Error("image height is not valid");

  // オリジナル画像描画用のキャンバスを作成
  const imageCanvas = createCanvas(width, height);
  const imageCtx = imageCanvas.getContext("2d");

  // オリジナル画像を描画
  const img = new Image();
  img.onload = () => imageCtx.drawImage(img, 0, 0, width, height);
  img.src = base64Image;

  // ピクセル化後の画像描画用のキャンバスを作成
  const pixelCanvas = createCanvas(width, height);
  const pixelCtx = pixelCanvas.getContext("2d");

  // ピクセル化後の画像を描画
  const [rWidth, rHeight] = cellSize(width, height, size);
  const pixelData = pixelCtx.getImageData(0, 0, rWidth, rHeight);

  // RGBを格納する配列を作成
  const rgbArray = [...Array(rWidth * rHeight)].map(() => [0, 0, 0]);

  for (let i = 0; i < rWidth; i++) {
    for (let j = 0; j < rHeight; j++) {
      const cell = imageCtx.getImageData(i * size, j * size, size, size);
      const cellData = cell.data;
      let avgR = 0;
      let avgG = 0;
      let avgB = 0;

      for (let k = 0; k < size * size * 4; k += 4) {
        avgR = ((avgR + cellData[k]) / 2) | 0;
        avgG = ((avgG + cellData[k + 1]) / 2) | 0;
        avgB = ((avgB + cellData[k + 2]) / 2) | 0;
      }

      rgbArray[i + j * rWidth] = [avgR, avgG, avgB];
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

  let buffer: Buffer;
  if (options.type === "jpeg") {
    buffer = await pixelCanvas.toBuffer("image/jpeg");
  } else {
    buffer = await pixelCanvas.toBuffer("image/png");
  }

  return buffer;
};
