import { VercelRequest } from "@vercel/node";

export type OptionalType = "jpeg" | "png";

export type RequestQueryOptions = {
  image: string;
  type: OptionalType;
};

export type ParsedOptions = {
  image: string;
  type: OptionalType;
};

const isOptionalType = (type: string): type is OptionalType => {
  return ["jpeg", "png"].includes(type);
};

export const parseRequest = (req: VercelRequest): ParsedOptions => {
  const { image, type = "jpeg" } = req.query;

  if (Array.isArray(image)) throw new Error("must not be array");
  if (Array.isArray(type)) throw new Error("must not be array");
  if (!isOptionalType(type)) throw new Error("must not be array");

  // const { base64Image, width, height, type } = await analyzeImage(image);

  // if (!base64Image) throw new Error("image is not valid");
  // if (!width) throw new Error("image width is not valid");
  // if (!height) throw new Error("image height is not valid");
  // if (!type) throw new Error("image type is not valid");

  return {
    image,
    type,
  };
};
