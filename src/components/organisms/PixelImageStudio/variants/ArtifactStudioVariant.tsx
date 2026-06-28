import { BeforeAfterPreview } from "../../BeforeAfterPreview";
import { ControlBar } from "../../ControlBar";
import { ImageSourcePicker } from "../../ImageSourcePicker";
import { OutputActions } from "../../OutputActions";
import type { PixelImageStudioViewProps } from "../types";

const FlowLabel = ({ number, label }: { number: string; label: string }) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10 text-sm font-black text-emerald-100">
      {number}
    </span>
    <h2 className="text-sm font-black uppercase tracking-[0.22em] text-slate-300">{label}</h2>
  </div>
);

export const ArtifactStudioVariant = ({ studio, themeSwitcher }: PixelImageStudioViewProps) => {
  return (
    <div className="min-h-screen bg-[#101217] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-[#171a22] p-5 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.34em] text-emerald-200">Artifact Studio</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Pixel Artifact Pipeline</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                外部画像を取り込み、加工し、API URL・Markdown・保存可能な成果物として扱う制作スタジオです。
              </p>
            </div>
            {themeSwitcher}
          </div>
        </header>

        <main className="mt-6 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)_360px]">
          <section className="rounded-3xl border border-white/10 bg-[#171a22] p-5">
            <FlowLabel number="1" label="Input" />
            <ImageSourcePicker
              source={studio.source}
              urlValue={studio.urlValue}
              onUrlChange={studio.setUrlSource}
              onUploadChange={studio.setUploadFile}
              compact
            />
          </section>

          <section className="space-y-5 rounded-3xl border border-white/10 bg-[#171a22] p-5">
            <FlowLabel number="2" label="Preview" />
            <BeforeAfterPreview
              originalPreviewUrl={studio.result.originalPreviewUrl}
              generatedPreviewUrl={studio.result.generatedPreviewUrl}
              isLoading={studio.result.isLoading}
              errorMessage={studio.result.errorMessage}
              comparisonMode="stacked"
              frameLabel="Artifact Studio stacked preview"
            />
          </section>

          <section className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-[#171a22] p-5">
              <FlowLabel number="3" label="Transform" />
              <ControlBar settings={studio.settings} updateSetting={studio.updateSetting} reset={studio.reset} />
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#171a22] p-5">
              <FlowLabel number="4" label="Export" />
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
