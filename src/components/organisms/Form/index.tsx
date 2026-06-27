import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import type { TvEffectPreset } from "../../../server/pixelImage/tvEffect/types";
import { Input } from "../../atoms/Input";
import { SizeInput } from "../../molecules/SizeInput";
import { TvEffectControls } from "../../molecules/TvEffectControls";

export type ImageFormOptions = {
  imageUrl: string;
  sampleSize: string;
  pixelSize: string;
  paletteSize: string;
  tvEffectEnabled: boolean;
  tvEffectPreset: TvEffectPreset;
  tvEffectStrength: string;
};

type ParameterField = {
  id: string;
  label: string;
  description: string;
  defaultValue: string;
  onValueChange: (value: string) => void;
};

const sizeRelationshipDescription =
  "Sample Sizeで元画像をいくつのマスに分けるかを決め、Pixel Sizeでその1マスを出力時に何px四方で描くかを決めます。";
const outputSizeDescription =
  "出力幅の目安: ceil(元画像幅 / Sample Size) × Pixel Size";

export const Form = ({
  handleImageUrl,
  defaultImageUrl,
  defaultSampleSize,
  defaultPixelSize,
  defaultPaletteSize,
}: {
  handleImageUrl: (options: ImageFormOptions) => void;
  defaultImageUrl: string;
  defaultSampleSize: string;
  defaultPixelSize: string;
  defaultPaletteSize: string;
}) => {
  const [imgUrl, setImgUrl] = useState<string>(defaultImageUrl);
  const [sampleSize, setSampleSize] = useState<string>(defaultSampleSize);
  const [pixelSize, setPixelSize] = useState<string>(defaultPixelSize);
  const [paletteSize, setPaletteSize] = useState<string>(defaultPaletteSize);
  const [tvEffectEnabled, setTvEffectEnabled] = useState<boolean>(false);
  const [tvEffectPreset, setTvEffectPreset] = useState<TvEffectPreset>("soft-tv");
  const [tvEffectStrength, setTvEffectStrength] = useState<string>("60");

  const handleOrigImageUrl = useCallback((origUrl: string) => {
    setImgUrl(origUrl);
  }, []);

  const handleSampleSize = useCallback((sampleSize: string) => {
    setSampleSize(sampleSize);
  }, []);
  const handlePixelSize = useCallback((pixelSize: string) => {
    setPixelSize(pixelSize);
  }, []);
  const handlePaletteSize = useCallback((paletteSize: string) => {
    setPaletteSize(paletteSize);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleImageUrl({
        imageUrl: imgUrl,
        sampleSize,
        pixelSize,
        paletteSize,
        tvEffectEnabled,
        tvEffectPreset,
        tvEffectStrength,
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [
    imgUrl,
    sampleSize,
    pixelSize,
    paletteSize,
    tvEffectEnabled,
    tvEffectPreset,
    tvEffectStrength,
    handleImageUrl,
  ]);

  const parameterFields: ParameterField[] = [
    {
      id: "sample-size",
      label: "Sample Size",
      description: "入力の細かさ。小さいほど多くのマスに分けて細部を拾う。",
      defaultValue: defaultSampleSize,
      onValueChange: handleSampleSize,
    },
    {
      id: "pixel-size",
      label: "Pixel Size",
      description: "出力の拡大率。Sample Sizeで作った1マスを何px四方で描くか。",
      defaultValue: defaultPixelSize,
      onValueChange: handlePixelSize,
    },
    {
      id: "palette-size",
      label: "Palette Size",
      description: "使用する色数の目安。大きいほど元画像に近い色数になる。",
      defaultValue: defaultPaletteSize,
      onValueChange: handlePaletteSize,
    },
  ];

  return (
    <form className={classNames("inline-block", "w-full")}>
      <div className={classNames("flex", "items-center", "w-full", "mt-4")}>
        <label htmlFor="image-url" className={classNames("text-white", "px-4", "py-2")}>
          URL
        </label>
        <Input handleChange={handleOrigImageUrl} value={imgUrl} id="image-url" />
      </div>
      <div className={classNames("mt-4", "px-4", "py-3", "text-sm", "text-gray-200")}>
        <p>{sizeRelationshipDescription}</p>
        <p className={classNames("mt-1", "text-xs", "text-gray-300")}>{outputSizeDescription}</p>
      </div>
      {parameterFields.map(({ id, label, description, defaultValue, onValueChange }) => {
        const descriptionId = `${id}-description`;

        return (
          <div key={id} className={classNames("flex", "items-center", "w-full", "mt-4")}>
            <div className={classNames("text-white", "px-4", "py-2", "w-48")}>
              <label htmlFor={id} className={classNames("block")}>
                {label}
              </label>
              <p id={descriptionId} className={classNames("mt-1", "text-xs", "text-gray-300")}>
                {description}
              </p>
            </div>
            <SizeInput
              onValueChange={onValueChange}
              defaultValue={defaultValue}
              id={id}
              ariaDescribedBy={descriptionId}
            />
          </div>
        );
      })}
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
