import classNames from "classnames";
import Image from "next/image";
import React from "react";

const HOST_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://pixel-image.vercel.app";

const createPixelImage = (imageUrl: string) => {
  const url = new URL(`${HOST_URL}/api`);
  url.searchParams.set("image", imageUrl);
  return url.toString();
};

export const Preview = ({ imageUrl }: { imageUrl: string }) => {
  const url = React.useMemo(() => createPixelImage(imageUrl), [imageUrl]);

  return (
    <div className={classNames("relative", "w-full", "h-72", "mt-12")}>
      {imageUrl && (
        <Image src={url} alt="Generated Pixel Image" layout="fill" objectFit="contain" />
      )}
    </div>
  );
};
