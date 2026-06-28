import classNames from "classnames";
import React from "react";
import type { ImageSource } from "../PixelImageStudio/types";

type ImageSourcePickerProps = {
  sourceKind: ImageSource["kind"];
  source: ImageSource;
  fileError: string | undefined;
  onSourceKindChange: (kind: ImageSource["kind"]) => void;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | undefined) => void;
  compact?: boolean;
};

export const ImageSourcePicker = ({
  sourceKind,
  source,
  fileError,
  onSourceKindChange,
  onUrlChange,
  onFileChange,
  compact = false,
}: ImageSourcePickerProps) => {
  return (
    <section className={classNames("space-y-3")}>
      <div className={classNames("flex", "gap-2")}>
        {[
          ["url", "URL"],
          ["upload", "Upload"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onSourceKindChange(value as ImageSource["kind"])}
            className={classNames(
              "flex-1",
              "border",
              "px-3",
              "py-2",
              "text-sm",
              "font-semibold",
              sourceKind === value
                ? "border-white bg-white text-black"
                : "border-white/20 bg-white/5 text-white",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {sourceKind === "url" ? (
        <div>
          <label htmlFor="pixel-image-url" className={classNames("mb-1", "block", "text-sm")}>
            Image URL
          </label>
          <input
            id="pixel-image-url"
            type="url"
            value={source.kind === "url" ? source.url : ""}
            onChange={(event) => onUrlChange(event.currentTarget.value)}
            className={classNames(
              "w-full",
              "border",
              "border-white/20",
              "bg-black/30",
              "px-3",
              "py-2",
              "text-sm",
              "text-white",
              "outline-none",
              "focus:border-white",
            )}
          />
          {!compact && (
            <p className={classNames("mt-1", "text-xs", "text-white/60")}>
              URL入力は共有可能なAPI URLを生成できます。
            </p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="pixel-image-upload" className={classNames("mb-1", "block", "text-sm")}>
            Upload PNG / JPEG
          </label>
          <input
            id="pixel-image-upload"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => onFileChange(event.currentTarget.files?.[0])}
            className={classNames(
              "w-full",
              "border",
              "border-white/20",
              "bg-black/30",
              "px-3",
              "py-2",
              "text-sm",
              "text-white",
            )}
          />
          <p className={classNames("mt-1", "text-xs", "text-white/60")}>
            アップロード画像は保存されず、共有URLは作成されません。
          </p>
          {fileError && (
            <p role="alert" className={classNames("mt-2", "text-sm", "text-red-200")}>
              {fileError}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
