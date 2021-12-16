import { VercelApiHandler } from "@vercel/node";
import { createImage } from "./_lib/createImage";
import { parseRequest } from "./_lib/parser";

const CACHE_MAX_AGE = 60 * 60 * 24;

const handler: VercelApiHandler = async (req, res) => {
  try {
    const options = parseRequest(req);
    const image = await createImage(options);

    res.status(200);
    res.setHeader("Content-Type", `image/${options.type}`);
    res.setHeader("Cache-Control", "public, max-age=86400");
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
