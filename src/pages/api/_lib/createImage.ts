import { createCanvas, Image } from "canvas";
import { analyzeImage } from "./analyzer";
import type { ParsedOptions } from "./parser";

type ImageMimeType = "image/jpeg" | "image/png";

const round64Size = (a: number, b: number): number[] => {
  if (a > b) {
  }
  return [a, b];
};

const isBufferType = (type: ImageMimeType): type is ImageMimeType => {
  return ["image/jpeg", "image/png"].includes(type);
};

export const createImage = async ({
  image,
  ...options
}: ParsedOptions): Promise<string | Buffer> => {
  const { base64Image, width, height } = await analyzeImage(image);

  if (!base64Image) throw new Error("image is not valid");
  if (!width) throw new Error("image width is not valid");
  if (!height) throw new Error("image height is not valid");

  const [rWidth, rHeight] = round64Size(width, height);

  const canvas = createCanvas(rWidth, rHeight);
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0);

  img.src = base64Image;
  let buffer: Buffer;
  if (options.type === "jpeg") {
    buffer = await canvas.toBuffer("image/jpeg");
  } else {
    buffer = await canvas.toBuffer("image/png");
  }

  return buffer;
};
