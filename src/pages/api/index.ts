import type { NextApiHandler } from "next";
import { analyzeUploadedImage } from "../../server/pixelImage/analyzer";
import { createImage, createImageFromBuffer } from "../../server/pixelImage/createImage";
import { isPixelImageError } from "../../server/pixelImage/errors";
import { parsePostRequest, parseRequest } from "../../server/pixelImage/parser";

const CACHE_MAX_AGE = 60 * 60 * 24;

const handler: NextApiHandler = async (req, res) => {
  try {
    if (!["GET", "POST"].includes(req.method ?? "")) {
      res.setHeader("Allow", "GET, POST");
      res.status(405);
      res.end("Method Not Allowed");
      return;
    }

    if (req.method === "POST") {
      const options = parsePostRequest(req);
      const image = await createImageFromBuffer(
        analyzeUploadedImage(options.imageDataUrl).imageBuffer,
        options,
      );

      res.status(200);
      res.setHeader("Content-Type", `image/${options.type}`);
      res.setHeader("Cache-Control", "no-store");
      res.end(image);
      return;
    }

    const options = parseRequest(req);
    const image = await createImage(options);

    res.status(200);
    res.setHeader("Content-Type", `image/${options.type}`);
    res.setHeader("Cache-Control", `public, max-age=${CACHE_MAX_AGE}`);
    res.end(image);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
    if (isPixelImageError(error)) {
      res.status(error.statusCode);
      res.end(error.message);
      return;
    }

    res.status(500);
    res.end("Internal Server Error");
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "7mb",
    },
  },
};

export default handler;
