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
  <figure
    className={classNames(
      "relative",
      "min-h-[22rem]",
      "overflow-hidden",
      "bg-black/40",
      "md:min-h-[36rem]",
    )}
  >
    <div
      className={classNames(
        "absolute",
        "left-3",
        "top-3",
        "z-10",
        "border",
        "border-white/20",
        "bg-black/70",
        "px-2",
        "py-1",
        "text-xs",
        "font-semibold",
        "uppercase",
        "tracking-[0.18em]",
        "text-white",
      )}
    >
      {label}
    </div>
    {imageUrl ? (
      <img src={imageUrl} alt={alt} className={classNames("h-full", "w-full", "object-contain")} />
    ) : (
      <div
        className={classNames(
          "flex",
          "h-full",
          "min-h-[22rem]",
          "items-center",
          "justify-center",
          "p-8",
          "text-center",
          "text-sm",
          "text-white/60",
        )}
      >
        Image preview waits here.
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
            "bg-black/60",
            "text-sm",
            "font-semibold",
            "text-white",
          )}
        >
          Generating pixel image...
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
            "border-red-300/70",
            "bg-red-950/90",
            "p-3",
            "text-sm",
            "text-red-50",
          )}
        >
          {errorMessage}
        </div>
      )}
    </>
  );

  return (
    <section className={classNames("relative", frameClassName)}>
      <div
        className={classNames("hidden", "h-full", "overflow-hidden", "md:grid", "md:grid-cols-2")}
      >
        <ImagePane label="Original" imageUrl={originalImageUrl} alt="Original image preview" />
        <ImagePane label="Pixelated" imageUrl={generatedImageUrl} alt="Pixelated image preview" />
      </div>

      <div className={classNames("md:hidden")}>
        <div className={classNames("relative", "min-h-[22rem]", "overflow-hidden", "bg-black/40")}>
          <ImagePane label="Original" imageUrl={originalImageUrl} alt="Original image preview" />
          <div
            className={classNames("absolute", "inset-0", "overflow-hidden")}
            style={{ clipPath: `inset(0 ${100 - mobileCompareNumber}% 0 0)` }}
          >
            <ImagePane
              label="Pixelated"
              imageUrl={generatedImageUrl}
              alt="Pixelated image preview"
            />
          </div>
          <div
            className={classNames(
              "absolute",
              "inset-y-0",
              "z-10",
              "w-0.5",
              "bg-cyan-100",
              "shadow-[0_0_12px_rgba(207,250,254,0.75)]",
            )}
            style={{ left: `${mobileCompareNumber}%` }}
          />
        </div>
        <label
          htmlFor="before-after-mobile-slider"
          className={classNames(
            "block",
            "border-t",
            "border-cyan-200/10",
            "bg-black/30",
            "p-3",
            "text-xs",
            "font-semibold",
            "text-cyan-100",
          )}
        >
          <span className={classNames("mb-2", "flex", "items-center", "justify-between", "gap-3")}>
            <span>Before / After</span>
            <span className={classNames("tabular-nums")}>{mobileCompare}% After</span>
          </span>
          <input
            id="before-after-mobile-slider"
            type="range"
            min="0"
            max="100"
            value={mobileCompare}
            onChange={(event) => setMobileCompare(event.currentTarget.value)}
            className={classNames("w-full", "accent-cyan-200")}
          />
        </label>
      </div>

      {overlay}
    </section>
  );
};
