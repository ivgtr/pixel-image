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
      className={classNames("space-y-3", "border", "border-zinc-100/10", "bg-[#101117]/85", "p-4")}
    >
      <div className={classNames("flex", "items-center", "justify-between", "gap-3")}>
        <h2 className={classNames("text-sm", "font-bold", "text-zinc-100")}>保存と共有</h2>
        <span className={classNames("text-xs", "text-zinc-100/45")}>
          {canShareApiUrl ? "共有できます" : "この画面だけ"}
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
            "text-sm",
            "font-semibold",
            canShareApiUrl
              ? "border-zinc-100/30 bg-zinc-100/90 text-[#111218]"
              : "cursor-not-allowed border-zinc-100/10 bg-white/5 text-zinc-100/35",
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
            "text-sm",
            "font-semibold",
            hasGeneratedImage
              ? "border-rose-100/50 bg-rose-100/90 text-[#171116]"
              : "cursor-not-allowed border-zinc-100/10 bg-white/5 text-zinc-100/35",
          )}
        >
          PNGを保存
        </button>
        <button
          type="button"
          onClick={onReset}
          className={classNames(
            "border",
            "border-zinc-100/10",
            "bg-[#0c0d12]",
            "px-3",
            "py-2",
            "text-sm",
            "font-semibold",
            "text-zinc-100/75",
          )}
        >
          もう一度試す
        </button>
      </div>

      <div
        className={classNames(
          "border",
          "border-zinc-100/10",
          "bg-[#0c0d12]",
          "p-3",
          "text-xs",
          "text-zinc-100/50",
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
