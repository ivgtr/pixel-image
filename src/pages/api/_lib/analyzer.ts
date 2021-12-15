import axios from "axios";
import imageSize from "image-size";
import type { OptionalType } from "./parser";

const isOptionalType = (type: string): type is OptionalType => {
  return ["jpeg", "png"].includes(type);
};

export const analyzeImage = async (url: string) => {
  const { base64, ofset, type } = await axios
    .get(url, { responseType: "arraybuffer" })
    .then((response) => {
      return {
        base64: Buffer.from(response.data, "binary").toString("base64"),
        ofset: imageSize(response.data),
        type: response.headers["content-type"].split("/")[1],
      };
    });

  return {
    base64Image: `data:image/${type};base64,${base64}`,
    width: ofset.width,
    height: ofset.height,
    type: isOptionalType(type) ? type : undefined,
  };
};
