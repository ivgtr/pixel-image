import { BeforeAfterPreview } from "../../BeforeAfterPreview";
import { ControlBar } from "../../ControlBar";
import { ImageSourcePicker } from "../../ImageSourcePicker";
import { OutputActions } from "../../OutputActions";
import type { PixelImageStudioViewProps } from "../types";

export const PixelLabVariant = ({ studio, themeSwitcher }: PixelImageStudioViewProps) => {
  return (
    <div className="min-h-screen bg-[#060914] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-cyan-300/20 bg-[#0b1020] p-5 shadow-2xl shadow-cyan-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.34em] text-cyan-200">Pixel Lab / UI exploration</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Pixel Image Studio</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                画像を観察し、入力サンプリング・出力ドット・色数・表示エフェクトの関係を検証する小さなピクセル研究装置です。
              </p>
            </div>
            {themeSwitcher}
          </div>
        </header>

        <main className="mt-6 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-5 rounded-3xl border border-white/10 bg-[#0b1020]/95 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
              Device ready
            </div>
            <ImageSourcePicker
              source={studio.source}
              urlValue={studio.urlValue}
              onUrlChange={studio.setUrlSource}
              onUploadChange={studio.setUploadFile}
            />
            <ControlBar settings={studio.settings} updateSetting={studio.updateSetting} reset={studio.reset} />
          </aside>

          <section className="space-y-5 rounded-3xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:22px_22px] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">Observation Deck</p>
                <h2 className="mt-1 text-2xl font-black text-white">Before / After measurement</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-slate-300">
                object-contain preview
              </span>
            </div>
            <BeforeAfterPreview
              originalPreviewUrl={studio.result.originalPreviewUrl}
              generatedPreviewUrl={studio.result.generatedPreviewUrl}
              isLoading={studio.result.isLoading}
              errorMessage={studio.result.errorMessage}
              comparisonMode="side-by-side"
              frameLabel="Pixel Lab before after preview"
            />
            <OutputActions
              result={studio.result}
              settings={studio.settings}
              copyStatus={studio.copyStatus}
              onCopyApiUrl={studio.copyApiUrl}
              onDownload={studio.downloadResult}
            />
          </section>
        </main>
      </div>
    </div>
  );
};
