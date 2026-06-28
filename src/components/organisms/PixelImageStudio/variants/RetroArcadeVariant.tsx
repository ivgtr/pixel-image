import { BeforeAfterPreview } from "../../BeforeAfterPreview";
import { ControlBar } from "../../ControlBar";
import { ImageSourcePicker } from "../../ImageSourcePicker";
import { OutputActions } from "../../OutputActions";
import type { PixelImageStudioViewProps } from "../types";

export const RetroArcadeVariant = ({ studio, themeSwitcher }: PixelImageStudioViewProps) => {
  return (
    <div className="min-h-screen bg-[#140b20] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border-4 border-[#f6c453] bg-[#2b1744] p-5 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.34em] text-[#f98f45]">Retro Arcade Console</p>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#fff4cf] sm:text-5xl">
                Pixel Cartridge
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100">
                カートリッジを差し替え、A/Bボタンで見比べるように触るゲーム機風の変換コンソールです。
              </p>
            </div>
            {themeSwitcher}
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <section className="rounded-[2rem] border-4 border-[#6f4bd8] bg-[#0b0812] p-4 shadow-2xl shadow-violet-950/60">
            <div className="rounded-[1.5rem] border-2 border-[#f98f45]/70 bg-black p-3">
              <BeforeAfterPreview
                originalPreviewUrl={studio.result.originalPreviewUrl}
                generatedPreviewUrl={studio.result.generatedPreviewUrl}
                isLoading={studio.result.isLoading}
                errorMessage={studio.result.errorMessage}
                comparisonMode="toggle"
                frameLabel="Retro Arcade CRT preview"
              />
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)_340px]">
            <div className="rounded-[1.5rem] border-4 border-[#f98f45] bg-[#34204f] p-5">
              <p className="mb-4 text-center text-xs font-black uppercase tracking-[0.28em] text-[#fff4cf]">
                Cartridge Slot
              </p>
              <ImageSourcePicker
                source={studio.source}
                urlValue={studio.urlValue}
                onUrlChange={studio.setUrlSource}
                onUploadChange={studio.setUploadFile}
                compact
              />
            </div>

            <div className="rounded-[1.5rem] border-4 border-[#f6c453] bg-[#1b102b] p-5">
              <p className="mb-4 text-center text-xs font-black uppercase tracking-[0.28em] text-[#f6c453]">
                Control Deck
              </p>
              <ControlBar
                settings={studio.settings}
                updateSetting={studio.updateSetting}
                reset={studio.reset}
                layout="strip"
              />
            </div>

            <div className="rounded-[1.5rem] border-4 border-[#d7487f] bg-[#2a1230] p-5">
              <p className="mb-4 text-center text-xs font-black uppercase tracking-[0.28em] text-[#ffb3cc]">
                Save / Share
              </p>
              <OutputActions
                result={studio.result}
                settings={studio.settings}
                copyStatus={studio.copyStatus}
                onCopyApiUrl={studio.copyApiUrl}
                onDownload={studio.downloadResult}
                compact
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
