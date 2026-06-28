import classNames from "classnames";
import React, { useState } from "react";

type BeforeAfterPreviewProps = {
  originalImageUrl: string | undefined;
  generatedImageUrl: string | undefined;
  isLoading: boolean;
  errorMessage: string | undefined;
  frameClassName?: string;
};

const ImagePane = ({
  label,
  imageUrl,
  alt,
}: {
  label: string;
  imageUrl: string | undefined;
  alt: string;
}) => (
  <figure className={classNames("relative", "min-h-[22rem]", "bg-[#09090d]", "md:min-h-[36rem]")}>
    <div
      className={classNames(
        "border-b",
        "border-[#a8b89c]/10",
        "bg-[#09090d]/76",
        "px-3",
        "py-2",
        "text-xs",
        "font-semibold",
        "text-[#ece7dc]/75",
      )}
    >
      {label}
    </div>
    {imageUrl ? (
      <div className={classNames("h-[calc(100%-2rem)]", "min-h-[20rem]", "md:min-h-[34rem]")}>
        <img
          src={imageUrl}
          alt={alt}
          className={classNames("h-full", "w-full", "object-contain")}
        />
      </div>
    ) : (
      <div
        className={classNames(
          "flex",
          "h-full",
          "min-h-[20rem]",
          "items-center",
          "justify-center",
          "p-8",
          "text-center",
          "text-sm",
          "text-[#c7c0b5]/45",
        )}
      >
        画像を読み込むとここに表示されます
      </div>
    )}
  </figure>
);

export const BeforeAfterPreview = ({
  originalImageUrl,
  generatedImageUrl,
  isLoading,
  errorMessage,
  frameClassName,
}: BeforeAfterPreviewProps) => {
  const [mobileCompare, setMobileCompare] = useState("50");
  const mobileCompareNumber = Number(mobileCompare);
  const overlay = (
    <>
      {isLoading && (
        <div
          role="status"
          className={classNames(
            "absolute",
            "inset-0",
            "z-20",
            "flex",
            "items-center",
            "justify-center",
            "bg-[#09090d]/75",
            "text-sm",
            "font-semibold",
            "text-[#ece7dc]",
          )}
        >
          変換中...
        </div>
      )}
      {errorMessage && (
        <div
          role="alert"
          className={classNames(
            "absolute",
            "bottom-3",
            "left-3",
            "right-3",
            "z-30",
            "border",
            "border-rose-200/40",
            "bg-[#24131a]/95",
            "p-3",
            "text-sm",
            "text-rose-50",
          )}
        >
          {errorMessage}
        </div>
      )}
    </>
  );

  return (
    <section className={classNames("relative", "overflow-hidden", frameClassName)}>
      <div
        className={classNames("hidden", "h-full", "overflow-hidden", "md:grid", "md:grid-cols-2")}
      >
        <ImagePane label="元画像" imageUrl={originalImageUrl} alt="Original image preview" />
        <ImagePane label="変換後" imageUrl={generatedImageUrl} alt="Pixelated image preview" />
      </div>

      <div className={classNames("md:hidden")}>
        <div className={classNames("relative", "min-h-[22rem]", "overflow-hidden", "bg-[#09090d]")}>
          <ImagePane label="元画像" imageUrl={originalImageUrl} alt="Original image preview" />
          <div
            className={classNames("absolute", "inset-0", "overflow-hidden")}
            style={{ clipPath: `inset(0 ${100 - mobileCompareNumber}% 0 0)` }}
          >
            <ImagePane label="変換後" imageUrl={generatedImageUrl} alt="Pixelated image preview" />
          </div>
          <div
            className={classNames("absolute", "inset-y-0", "z-10", "w-0.5", "bg-[#e9b9c8]/80")}
            style={{ left: `${mobileCompareNumber}%` }}
          />
        </div>
        <label
          htmlFor="before-after-mobile-slider"
          className={classNames(
            "block",
            "border-t",
            "border-[#a8b89c]/10",
            "bg-[#100d13]",
            "p-3",
            "text-xs",
            "font-semibold",
            "text-[#c7c0b5]/75",
          )}
        >
          <span className={classNames("mb-2", "flex", "items-center", "justify-between", "gap-3")}>
            <span>元画像 / 変換後</span>
            <span className={classNames("tabular-nums")}>変換後 {mobileCompare}%</span>
          </span>
          <input
            id="before-after-mobile-slider"
            type="range"
            min="0"
            max="100"
            value={mobileCompare}
            onChange={(event) => setMobileCompare(event.currentTarget.value)}
            className={classNames("w-full", "accent-[#e9b9c8]")}
          />
        </label>
      </div>

      {overlay}
    </section>
  );
};
