import type { NextApiHandler } from "next";
import { createImage } from "../../server/pixelImage/createImage";
import { parseRequest } from "../../server/pixelImage/parser";

const CACHE_MAX_AGE = 60 * 60 * 24;

const handler: NextApiHandler = async (req, res) => {
  try {
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
    res.status(500);
    res.end();
  }
};

export default handler;
