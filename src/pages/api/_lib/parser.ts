import type { NextApiRequest } from "next";

export type OptionalType = "jpeg" | "png";

export type ParsedOptions = {
  image: string;
  type: OptionalType;
  size: number;
  k: number;
};

const isOptionalType = (type: string): type is OptionalType => {
  return ["jpeg", "png"].includes(type);
};

export const parseRequest = (req: NextApiRequest): ParsedOptions => {
  const { image, type = "jpeg", size = "15", k = "8" } = req.query;

  if (Array.isArray(image)) throw new Error("must not be array");
  if (Array.isArray(size)) throw new Error("must not be array");
  if (Array.isArray(type)) throw new Error("must not be array");
  if (Array.isArray(k)) throw new Error("must not be array");
  if (!image) throw new Error("image is required");
  if (!isOptionalType(type)) throw new Error("must not be array");

  return {
    image,
    type,
    size: Number(size),
    k: Number(k),
  };
};
