import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Input } from "../../atoms/Input";
import { SizeInput } from "../../molecules/SizeInput";

export type TvEffectPreset = "soft-tv" | "ntsc" | "crt" | "famicom-composite" | "sharp-emulator";

export type ImageFormOptions = {
  origUrl: string;
  size: string;
  k: string;
  tvEffectEnabled: boolean;
  tvEffectPreset: TvEffectPreset;
  tvEffectStrength: string;
};

const tvEffectPresets: { value: TvEffectPreset; label: string }[] = [
  { value: "soft-tv", label: "Soft TV" },
  { value: "ntsc", label: "NTSC" },
  { value: "crt", label: "CRT" },
  { value: "famicom-composite", label: "Famicom Composite" },
  { value: "sharp-emulator", label: "Sharp Emulator" },
];

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
        origUrl: imgUrl,
        size: cellSize,
        k: kSize,
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
      <div className={classNames("flex", "items-center", "w-full", "mt-4")}>
        <label htmlFor="tv-effect" className={classNames("text-white", "px-4", "py-2")}>
          TV Effect
        </label>
        <input
          type="checkbox"
          id="tv-effect"
          checked={tvEffectEnabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTvEffectEnabled(e.currentTarget.checked)
          }
          className={classNames("w-6", "h-6")}
        />
      </div>
      <div className={classNames("flex", "items-center", "w-full", "mt-4")}>
        <label htmlFor="tv-effect-preset" className={classNames("text-white", "px-4", "py-2")}>
          Preset
        </label>
        <select
          id="tv-effect-preset"
          value={tvEffectPreset}
          disabled={!tvEffectEnabled}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setTvEffectPreset(e.currentTarget.value as TvEffectPreset)
          }
          className={classNames("h-12", "px-4", "py-2", "border-2", "border-gray-600", "rounded-lg")}
        >
          {tvEffectPresets.map(({ value, label }) => {
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      </div>
      <div className={classNames("flex", "items-center", "w-full", "mt-4")}>
        <label htmlFor="tv-effect-strength" className={classNames("text-white", "px-4", "py-2")}>
          Strength
        </label>
        <input
          type="range"
          id="tv-effect-strength"
          min="0"
          max="100"
          value={tvEffectStrength}
          disabled={!tvEffectEnabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTvEffectStrength(e.currentTarget.value)
          }
          className={classNames("w-full")}
        />
        <span className={classNames("text-white", "px-4", "py-2")}>{tvEffectStrength}</span>
      </div>
    </form>
  );
};
