import classNames from "classnames";
import React from "react";

type OutputActionsProps = {
  apiUrl: string | undefined;
  canShareApiUrl: boolean;
  hasGeneratedImage: boolean;
  copied: boolean;
  onCopyApiUrl: () => void;
  onDownload: () => void;
  onReset: () => void;
  compact?: boolean;
};

export const OutputActions = ({
  apiUrl,
  canShareApiUrl,
  hasGeneratedImage,
  copied,
  onCopyApiUrl,
  onDownload,
  onReset,
  compact = false,
}: OutputActionsProps) => {
  return (
    <section className={classNames("space-y-3")}>
      <div className={classNames("grid", "gap-2", compact ? "grid-cols-1" : "sm:grid-cols-3")}>
        <button
          type="button"
          onClick={onCopyApiUrl}
          disabled={!canShareApiUrl}
          className={classNames(
            "border",
            "px-3",
            "py-2",
            "text-sm",
            "font-semibold",
            canShareApiUrl
              ? "border-emerald-200 bg-emerald-200 text-black"
              : "cursor-not-allowed border-white/10 bg-white/5 text-white/40",
          )}
        >
          {copied ? "Copied" : "Copy API URL"}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!hasGeneratedImage}
          className={classNames(
            "border",
            "px-3",
            "py-2",
            "text-sm",
            "font-semibold",
            hasGeneratedImage
              ? "border-yellow-200 bg-yellow-200 text-black"
              : "cursor-not-allowed border-white/10 bg-white/5 text-white/40",
          )}
        >
          Download result
        </button>
        <button
          type="button"
          onClick={onReset}
          className={classNames(
            "border",
            "border-white/20",
            "bg-black/30",
            "px-3",
            "py-2",
            "text-sm",
            "font-semibold",
            "text-white",
          )}
        >
          Reset
        </button>
      </div>

      <div
        className={classNames(
          "border",
          "border-white/10",
          "bg-black/25",
          "p-3",
          "text-xs",
          "text-white/70",
        )}
      >
        {canShareApiUrl && apiUrl ? (
          <p className={classNames("break-all")}>{apiUrl}</p>
        ) : (
          <p>アップロード画像はローカル処理のため共有URLを作れません。</p>
        )}
      </div>
    </section>
  );
};
