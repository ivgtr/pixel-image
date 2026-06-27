import classNames from "classnames";
import React from "react";

/* <Image src={url} alt="Generated Pixel Image" layout="fill" objectFit="contain" /> */

export const Preview = ({ imageUrl }: { imageUrl: string | undefined }) => {
  return (
    <div className={classNames("relative", "w-full", "h-72", "mt-12", "overflow-auto")}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Generated Pixel Image"
          className={classNames("max-w-none")}
          style={{ imageRendering: "pixelated" }}
        />
      )}
    </div>
  );
};
