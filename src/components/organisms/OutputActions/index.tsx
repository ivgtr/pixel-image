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
    <section
      className={classNames("space-y-3", "border", "border-cyan-100/15", "bg-[#080d12]/90", "p-4")}
    >
      <div className={classNames("flex", "items-center", "justify-between", "gap-3")}>
        <h2
          className={classNames(
            "font-mono",
            "text-xs",
            "font-bold",
            "uppercase",
            "tracking-[0.16em]",
            "text-cyan-50",
          )}
        >
          出力
        </h2>
        <span className={classNames("font-mono", "text-[0.68rem]", "text-pink-100/70")}>
          {canShareApiUrl ? "[shareable]" : "[local-only]"}
        </span>
      </div>
      <div className={classNames("grid", "gap-2", compact ? "grid-cols-1" : "sm:grid-cols-3")}>
        <button
          type="button"
          onClick={onCopyApiUrl}
          disabled={!canShareApiUrl}
          className={classNames(
            "border",
            "px-3",
            "py-2",
            "font-mono",
            "text-xs",
            "font-semibold",
            canShareApiUrl
              ? "border-cyan-100 bg-cyan-50 text-[#061014]"
              : "cursor-not-allowed border-cyan-100/10 bg-white/5 text-cyan-50/35",
          )}
        >
          {copied ? "コピー済み" : "API URLをコピー"}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!hasGeneratedImage}
          className={classNames(
            "border",
            "px-3",
            "py-2",
            "font-mono",
            "text-xs",
            "font-semibold",
            hasGeneratedImage
              ? "border-pink-100 bg-pink-100 text-[#160b12]"
              : "cursor-not-allowed border-cyan-100/10 bg-white/5 text-cyan-50/35",
          )}
        >
          PNGを保存
        </button>
        <button
          type="button"
          onClick={onReset}
          className={classNames(
            "border",
            "border-cyan-100/15",
            "bg-[#05070b]",
            "px-3",
            "py-2",
            "font-mono",
            "text-xs",
            "font-semibold",
            "text-cyan-50",
          )}
        >
          もう一度試す
        </button>
      </div>

      <div
        className={classNames(
          "border",
          "border-cyan-100/10",
          "bg-[#05070b]",
          "p-3",
          "font-mono",
          "text-xs",
          "text-cyan-100/60",
        )}
      >
        {canShareApiUrl && apiUrl ? (
          <p className={classNames("break-all")}>{apiUrl}</p>
        ) : (
          <p>アップロード画像はローカル処理です。共有URLは作れません。</p>
        )}
      </div>
    </section>
  );
};
