import type { NextApiHandler } from "next";
import { createImage } from "../../server/pixelImage/createImage";
import { isPixelImageError } from "../../server/pixelImage/errors";
import { parsePostRequest, parseRequest } from "../../server/pixelImage/parser";

const CACHE_MAX_AGE = 60 * 60 * 24;

const handler: NextApiHandler = async (req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      res.status(405);
      res.end("Method Not Allowed");
      return;
    }

    const options = req.method === "POST" ? parsePostRequest(req) : parseRequest(req);
    const image = await createImage(options);

    res.status(200);
    res.setHeader("Content-Type", `image/${options.type}`);
    res.setHeader(
      "Cache-Control",
      req.method === "POST" ? "no-store" : `public, max-age=${CACHE_MAX_AGE}`,
    );
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

export default handler;
