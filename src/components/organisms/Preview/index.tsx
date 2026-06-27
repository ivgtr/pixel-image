import classNames from "classnames";
import React from "react";

/* <Image src={url} alt="Generated Pixel Image" layout="fill" objectFit="contain" /> */

export const Preview = ({ imageUrl }: { imageUrl: string | undefined }) => {
  return (
    <div className={classNames("relative", "flex", "items-center", "justify-center", "w-full", "h-72", "mt-12")}> 
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Generated Pixel Image"
          className={classNames("max-w-full", "max-h-full")}
          style={{ imageRendering: "pixelated" }}
        />
      )}
    </div>
  );
};
