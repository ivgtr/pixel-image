import classNames from "classnames";
import React from "react";

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
  <figure className={classNames("relative", "min-h-[18rem]", "overflow-hidden", "bg-black/40")}>
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
          "min-h-[18rem]",
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
    <div
      className={classNames(
        "relative",
        "grid",
        "overflow-hidden",
        "md:grid-cols-2",
        frameClassName,
      )}
    >
      <ImagePane label="Original" imageUrl={originalImageUrl} alt="Original image preview" />
      <ImagePane label="Pixelated" imageUrl={generatedImageUrl} alt="Pixelated image preview" />
      {overlay}
    </div>
  );
};
