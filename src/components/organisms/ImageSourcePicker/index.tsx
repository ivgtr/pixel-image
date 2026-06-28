import classNames from "classnames";
import type { ChangeEvent } from "react";
import type { ImageSource } from "../PixelImageStudio/types";
import { maxUploadBytes } from "../PixelImageStudio/types";

type ImageSourcePickerProps = {
  source: ImageSource;
  urlValue: string;
  onUrlChange: (url: string) => void;
  onUploadChange: (file: File | undefined) => void;
  compact?: boolean;
};

const formatBytes = (bytes: number): string => {
  return `${Math.round(bytes / 1024 / 1024)}MB`;
};

export const ImageSourcePicker = ({
  source,
  urlValue,
  onUrlChange,
  onUploadChange,
  compact = false,
}: ImageSourcePickerProps) => {
  const uploadHelpId = "image-upload-help";

  return (
    <section className={classNames("space-y-4", compact ? "text-sm" : undefined)}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Image Source</p>
        <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Image source type">
          <button
            type="button"
            aria-pressed={source.kind === "url"}
            onClick={() => onUrlChange(urlValue)}
            className={classNames(
              "rounded-xl border px-3 py-2 text-sm font-semibold transition",
              source.kind === "url"
                ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10",
            )}
          >
            URL
          </button>
          <span
            className={classNames(
              "rounded-xl border px-3 py-2 text-center text-sm font-semibold",
              source.kind === "upload"
                ? "border-amber-300 bg-amber-300/15 text-amber-100"
                : "border-white/15 bg-white/5 text-slate-300",
            )}
          >
            Upload
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="pixel-image-url" className="text-sm font-semibold text-slate-100">
          Remote image URL
        </label>
        <input
          id="pixel-image-url"
          type="url"
          value={urlValue}
          onChange={(event) => onUrlChange(event.currentTarget.value)}
          placeholder="https://example.com/image.png"
          className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
        />
        <p className="text-xs text-slate-400">URL入力時のみ、共有できるAPI URLを生成できます。</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="pixel-image-upload" className="text-sm font-semibold text-slate-100">
          Local upload
        </label>
        <input
          id="pixel-image-upload"
          type="file"
          accept="image/png,image/jpeg"
          aria-describedby={uploadHelpId}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onUploadChange(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
          className="w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-3 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:bg-white/10"
        />
        <p id={uploadHelpId} className="text-xs leading-relaxed text-slate-400">
          PNG / JPEG、{formatBytes(maxUploadBytes)}以下。アップロード画像は保存せず、共有URL化もしません。
        </p>
        {source.kind === "upload" && (
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
            Local-only: {source.file.name} はこのブラウザ内だけで変換されます。
          </div>
        )}
      </div>
    </section>
  );
};
