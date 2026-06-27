import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import type { TvEffectPreset } from "../../../server/pixelImage/tvEffect/types";
import { Input } from "../../atoms/Input";
import { SizeInput } from "../../molecules/SizeInput";
import { TvEffectControls } from "../../molecules/TvEffectControls";

export type ImageFormOptions = {
  imageUrl: string;
  cellSize: string;
  kSize: string;
  tvEffectEnabled: boolean;
  tvEffectPreset: TvEffectPreset;
  tvEffectStrength: string;
};

export const Form = ({
  handleImageUrl,
  defaultImageUrl,
  defaultCellSize,
  defaultKSize,
}: {
  handleImageUrl: (options: ImageFormOptions) => void;
  defaultImageUrl: string;
  defaultCellSize: string;
  defaultKSize: string;
}) => {
  const [imgUrl, setImgUrl] = useState<string>(defaultImageUrl);
  const [cellSize, setCellSize] = useState<string>(defaultCellSize);
  const [kSize, setKSize] = useState<string>(defaultKSize);
  const [tvEffectEnabled, setTvEffectEnabled] = useState<boolean>(false);
  const [tvEffectPreset, setTvEffectPreset] = useState<TvEffectPreset>("soft-tv");
  const [tvEffectStrength, setTvEffectStrength] = useState<string>("60");

  const handleOrigImageUrl = useCallback((origUrl: string) => {
    setImgUrl(origUrl);
  }, []);

  const handleCellSize = useCallback((cellSize: string) => {
    setCellSize(cellSize);
  }, []);
  const handleKSize = useCallback((kSize: string) => {
    setKSize(kSize);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleImageUrl({
        imageUrl: imgUrl,
        cellSize,
        kSize,
        tvEffectEnabled,
        tvEffectPreset,
        tvEffectStrength,
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [
    imgUrl,
    cellSize,
    kSize,
    tvEffectEnabled,
    tvEffectPreset,
    tvEffectStrength,
    handleImageUrl,
  ]);

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
          Cell-Size
        </label>
        <SizeInput handleChange={handleCellSize} value={defaultCellSize} id="cell-size" />
      </div>
      <div className={classNames("flex", "items-center", "w-full", "mt-4")}>
        <label htmlFor="k-size" className={classNames("text-white", "px-4", "py-2")}>
          K-Size
        </label>
        <SizeInput handleChange={handleKSize} value={defaultKSize} id="k-size" />
      </div>
      <TvEffectControls
        enabled={tvEffectEnabled}
        preset={tvEffectPreset}
        strength={tvEffectStrength}
        onEnabledChange={setTvEffectEnabled}
        onPresetChange={setTvEffectPreset}
        onStrengthChange={setTvEffectStrength}
      />
    </form>
  );
};
