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
      className={classNames("space-y-3", "border", "border-[#a8b89c]/10", "bg-[#18131a]/88", "p-4")}
    >
      <div className={classNames("flex", "items-center", "justify-between", "gap-3")}>
        <h2 className={classNames("text-sm", "font-bold", "text-[#ece7dc]")}>保存と共有</h2>
        <span className={classNames("text-xs", "text-[#c7c0b5]/45")}>
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
              ? "border-[#a8b89c]/60 bg-[#cfd8bd] text-[#141118]"
              : "cursor-not-allowed border-[#a8b89c]/10 bg-white/5 text-[#c7c0b5]/35",
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
              ? "border-[#e9b9c8]/60 bg-[#e9c3cf] text-[#171116]"
              : "cursor-not-allowed border-[#a8b89c]/10 bg-white/5 text-[#c7c0b5]/35",
          )}
        >
          PNGを保存
        </button>
        <button
          type="button"
          onClick={onReset}
          className={classNames(
            "border",
            "border-[#a8b89c]/10",
            "bg-[#100d13]",
            "px-3",
            "py-2",
            "text-sm",
            "font-semibold",
            "text-[#ece7dc]/75",
          )}
        >
          もう一度試す
        </button>
      </div>

      <div
        className={classNames(
          "border",
          "border-[#a8b89c]/10",
          "bg-[#100d13]",
          "p-3",
          "text-xs",
          "text-[#c7c0b5]/50",
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
