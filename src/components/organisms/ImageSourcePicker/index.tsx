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
      <div className={classNames("grid", "grid-cols-2", "gap-2")}>
        {[
          ["url", "URL"],
          ["upload", "アップロード"],
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
                ? "border-[#a8b89c]/60 bg-[#cfd8bd] text-[#141118]"
                : "border-[#a8b89c]/12 bg-[#100d13] text-[#c7c0b5]/68 hover:border-[#a8b89c]/32",
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
              "border-[#a8b89c]/10",
              "bg-[#100d13]",
              "px-3",
              "py-2",
              "text-sm",
              "text-[#ece7dc]",
              "outline-none",
              "placeholder:text-[#c7c0b5]/30",
              "focus:border-[#a8b89c]/48",
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
              "border-[#a8b89c]/10",
              "bg-[#100d13]",
              "px-3",
              "py-2",
              "text-sm",
              "text-[#ece7dc]",
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
