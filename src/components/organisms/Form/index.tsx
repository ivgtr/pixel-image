import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { Input } from "../../atoms/Input";
import { SizeInput } from "../../molecules/SizeInput";

export const Form = ({
  handleImageUrl,
  defaultImageUrl,
  defaultCellSize,
}: {
  handleImageUrl: (origUrl: string, size: string) => void;
  defaultImageUrl: string;
  defaultCellSize: string;
}) => {
  const [imgUrl, setImgUrl] = useState<string>(defaultImageUrl);
  const [cellSize, setCellSize] = useState<string>(defaultCellSize);

  const handleOrigImageUrl = useCallback((origUrl: string) => {
    setImgUrl(origUrl);
  }, []);

  const handleCellSize = useCallback((cellSize: string) => {
    setCellSize(cellSize);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleImageUrl(imgUrl, cellSize);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [imgUrl, cellSize, handleImageUrl]);

  return (
    <form className={classNames("inline-block", "w-full")}>
      <div className={classNames("flex", "items-center", "w-full", "mt-4")}>
        <label htmlFor="image-url" className={classNames("text-white", "px-4", "py-2")}>
          URL
        </label>
        <Input handleChange={handleOrigImageUrl} value={imgUrl} id="image-url" />
      </div>
      <div className={classNames("flex", "items-center", "w-full", "mt-4")}>
        <label htmlFor="cell-size" className={classNames("text-white", "px-4", "py-2")}>
          Size
        </label>
        <SizeInput handleChange={handleCellSize} value={defaultCellSize} id="cell-size" />
      </div>
    </form>
  );
};
