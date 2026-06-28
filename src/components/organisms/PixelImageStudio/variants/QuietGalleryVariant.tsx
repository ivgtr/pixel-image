import { useState } from "react";
import { BeforeAfterPreview } from "../../BeforeAfterPreview";
import { ControlBar } from "../../ControlBar";
import { ImageSourcePicker } from "../../ImageSourcePicker";
import { OutputActions } from "../../OutputActions";
import type { PixelImageStudioViewProps } from "../types";

export const QuietGalleryVariant = ({ studio, themeSwitcher }: PixelImageStudioViewProps) => {
  const [isControlOpen, setIsControlOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080d12] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-slate-400">Quiet Pixel Gallery</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Pixel Viewing Room</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              画像の変化を眺めることを主役にした、余白多めのギャラリー型モードです。
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            {themeSwitcher}
            <button
              type="button"
              onClick={() => setIsControlOpen((current) => !current)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {isControlOpen ? "Hide controls" : "Show controls"}
            </button>
          </div>
        </header>

        <main className="mt-6 grid gap-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 backdrop-blur">
            <BeforeAfterPreview
              originalPreviewUrl={studio.result.originalPreviewUrl}
              generatedPreviewUrl={studio.result.generatedPreviewUrl}
              isLoading={studio.result.isLoading}
              errorMessage={studio.result.errorMessage}
              comparisonMode="split"
              frameLabel="Quiet Gallery split preview"
              className="min-h-[520px]"
            />
          </section>

          {isControlOpen && (
            <section className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur lg:grid-cols-[360px_minmax(0,1fr)]">
              <ImageSourcePicker
                source={studio.source}
                urlValue={studio.urlValue}
                onUrlChange={studio.setUrlSource}
                onUploadChange={studio.setUploadFile}
              />
              <ControlBar
                settings={studio.settings}
                updateSetting={studio.updateSetting}
                reset={studio.reset}
                layout="strip"
              />
            </section>
          )}

          <OutputActions
            result={studio.result}
            settings={studio.settings}
            copyStatus={studio.copyStatus}
            onCopyApiUrl={studio.copyApiUrl}
            onDownload={studio.downloadResult}
          />
        </main>
      </div>
    </div>
  );
};
