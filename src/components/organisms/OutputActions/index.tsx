import classNames from "classnames";
import type { CopyStatus, PixelImageResult, PixelImageSettings } from "../PixelImageStudio/types";

type OutputActionsProps = {
  result: PixelImageResult;
  settings: PixelImageSettings;
  copyStatus: CopyStatus;
  onCopyApiUrl: () => void;
  onDownload: () => void;
  compact?: boolean;
};

const metadataClass = "rounded-xl border border-white/10 bg-white/5 px-3 py-2";

export const OutputActions = ({
  result,
  settings,
  copyStatus,
  onCopyApiUrl,
  onDownload,
  compact = false,
}: OutputActionsProps) => {
  const copyLabel = copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy API URL";
  const markdownSnippet = result.apiUrl ? `[![pixel-image](${result.apiUrl})](${result.apiUrl})` : "";

  return (
    <section className={classNames("rounded-3xl border border-white/10 bg-black/25 p-4 text-slate-100", compact ? "text-sm" : undefined)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Output Actions</p>
          <h2 className="mt-1 text-lg font-black text-white">Pixel artifact</h2>
        </div>
        <span
          className={classNames(
            "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]",
            result.canShareApiUrl
              ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
              : "border-amber-300/40 bg-amber-300/10 text-amber-100",
          )}
        >
          {result.canShareApiUrl ? "Shareable" : "Local only"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <div className={metadataClass}>
          <span className="block text-slate-400">Sample</span>
          <strong className="text-white">{settings.sampleSize}</strong>
        </div>
        <div className={metadataClass}>
          <span className="block text-slate-400">Pixel</span>
          <strong className="text-white">{settings.pixelSize}</strong>
        </div>
        <div className={metadataClass}>
          <span className="block text-slate-400">Palette</span>
          <strong className="text-white">{settings.paletteSize} colors</strong>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onCopyApiUrl}
          disabled={!result.canShareApiUrl || !result.apiUrl}
          className="rounded-2xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
        >
          {copyLabel}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!result.generatedPreviewUrl}
          className="rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-50 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
        >
          Download result
        </button>
      </div>

      {result.canShareApiUrl && result.apiUrl ? (
        <div className="mt-4 grid gap-3">
          <div>
            <label htmlFor="api-url-output" className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              API URL
            </label>
            <textarea
              id="api-url-output"
              readOnly
              value={result.apiUrl}
              rows={compact ? 2 : 3}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-3 font-mono text-xs text-slate-200 outline-none"
            />
          </div>
          <div>
            <label htmlFor="markdown-snippet-output" className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Markdown snippet
            </label>
            <textarea
              id="markdown-snippet-output"
              readOnly
              value={markdownSnippet}
              rows={compact ? 2 : 3}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-3 font-mono text-xs text-slate-200 outline-none"
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          アップロード画像はローカル処理のため、共有用API URLは作成しません。生成結果はDownloadで保存できます。
        </p>
      )}
    </section>
  );
};
