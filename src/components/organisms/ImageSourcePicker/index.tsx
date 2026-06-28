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
      <div className={classNames("grid", "grid-cols-2", "gap-1", "font-mono")}>
        {[
          ["url", "[url]"],
          ["upload", "[upload]"],
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
              "text-xs",
              "font-semibold",
              "tracking-[0.08em]",
              sourceKind === value
                ? "border-cyan-100 bg-cyan-50 text-[#061014]"
                : "border-cyan-100/15 bg-[#05070b]/60 text-cyan-50/70 hover:border-cyan-100/35",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {sourceKind === "url" ? (
        <div>
          <label htmlFor="pixel-image-url" className={classNames("mb-1", "block", "text-sm")}>
            画像URL
          </label>
          <input
            id="pixel-image-url"
            type="url"
            value={source.kind === "url" ? source.url : ""}
            onChange={(event) => onUrlChange(event.currentTarget.value)}
            className={classNames(
              "w-full",
              "border",
              "border-cyan-100/15",
              "bg-[#05070b]",
              "px-3",
              "py-2",
              "font-mono",
              "text-sm",
              "text-cyan-50",
              "outline-none",
              "placeholder:text-cyan-100/30",
              "focus:border-cyan-100/70",
            )}
          />
          {!compact && (
            <p className={classNames("mt-1", "text-xs", "text-white/60")}>
              URL入力は共有用API URLを作れます。
            </p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="pixel-image-upload" className={classNames("mb-1", "block", "text-sm")}>
            PNG / JPEGを読み込む
          </label>
          <input
            id="pixel-image-upload"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => onFileChange(event.currentTarget.files?.[0])}
            className={classNames(
              "w-full",
              "border",
              "border-cyan-100/15",
              "bg-[#05070b]",
              "px-3",
              "py-2",
              "font-mono",
              "text-sm",
              "text-cyan-50",
            )}
          />
          <p className={classNames("mt-1", "text-xs", "text-white/60")}>
            保存しません。共有URLも作りません。
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
