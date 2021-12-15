import { VercelRequest } from "@vercel/node";

export type OptionalType = "jpeg" | "png";

type RequestQueryOptions = {
  image: string;
  type: OptionalType;
  size: number;
};

export type ParsedOptions = {
  image: string;
  type: OptionalType;
  size: number;
};

const isOptionalType = (type: string): type is OptionalType => {
  return ["jpeg", "png"].includes(type);
};

export const parseRequest = (req: VercelRequest): ParsedOptions => {
  const { image, type = "jpeg", size = "15" } = req.query;

  if (Array.isArray(image)) throw new Error("must not be array");
  if (Array.isArray(size)) throw new Error("must not be array");
  if (Array.isArray(type)) throw new Error("must not be array");
  if (!isOptionalType(type)) throw new Error("must not be array");

  return {
    image,
    type,
    size: Number(size),
  };
};
