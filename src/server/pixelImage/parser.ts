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

const parseInteger = (value: string, name: string, min: number, max: number): number => {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be an integer`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }

  return parsed;
};

export const parseRequest = (req: NextApiRequest): ParsedOptions => {
  const { image, type = "jpeg", size = "15", k = "8" } = req.query;

  if (Array.isArray(image)) throw new Error("must not be array");
  if (Array.isArray(size)) throw new Error("must not be array");
  if (Array.isArray(type)) throw new Error("must not be array");
  if (Array.isArray(k)) throw new Error("must not be array");
  if (!image) throw new Error("image is required");
  if (!isOptionalType(type)) throw new Error("type must be jpeg or png");

  return {
    image,
    type,
    size: parseInteger(size, "size", 1, 50),
    k: parseInteger(k, "k", 1, 50),
  };
};
