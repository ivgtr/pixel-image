import classNames from "classnames";
import React, { useState } from "react";
import { BeforeAfterPreview } from "../../BeforeAfterPreview";
import { ControlBar } from "../../ControlBar";
import { ImageSourcePicker } from "../../ImageSourcePicker";
import { OutputActions } from "../../OutputActions";
import type { PixelImageStudioState } from "../types";

export const PixelLabVariant = ({ studio }: { studio: PixelImageStudioState }) => {
  const [controlsOpen, setControlsOpen] = useState(false);
  const sourceLabel = studio.sourceKind === "url" ? "URL" : "アップロード";
  const shareLabel = studio.result.canShareApiUrl ? "共有できます" : "この画面だけ";

  return (
    <div
      className={classNames(
        "min-h-screen",
        "bg-[#0b0b10]",
        "px-4",
        "py-5",
        "text-zinc-100",
        "md:px-6",
      )}
    >
      <div
        className={classNames(
          "mx-auto",
          "grid",
          "max-w-[92rem]",
          "gap-6",
          "lg:grid-cols-[21rem_minmax(0,1fr)]",
        )}
      >
        <aside
          className={classNames(
            "order-2",
            "space-y-4",
            "lg:order-1",
            "lg:sticky",
            "lg:top-5",
            "lg:self-start",
          )}
        >
          <header className={classNames("bg-[#111218]/82", "p-4")}>
            <div className={classNames("flex", "items-start", "justify-between", "gap-3")}>
              <div>
                <h1 className={classNames("text-2xl", "font-black", "leading-tight")}>
                  Pixel Image
                </h1>
                <p className={classNames("mt-2", "text-sm", "leading-6", "text-zinc-100/58")}>
                  画像を、粗く、軽く、絵のように。
                </p>
              </div>
              <span
                className={classNames(
                  "bg-zinc-100/8",
                  "px-2.5",
                  "py-1.5",
                  "text-xs",
                  "text-zinc-100/55",
                )}
              >
                {studio.result.isLoading ? "変換中" : "プレビュー"}
              </span>
            </div>
          </header>

          <button
            type="button"
            onClick={() => setControlsOpen((current) => !current)}
            className={classNames(
              "flex",
              "w-full",
              "items-center",
              "justify-between",
              "bg-[#111218]/82",
              "px-4",
              "py-3",
              "text-left",
              "text-sm",
              "font-semibold",
              "text-zinc-100/82",
              "lg:hidden",
            )}
            aria-expanded={controlsOpen}
            aria-controls="pixel-lab-controls"
          >
            <span>設定を開く</span>
            <span>{controlsOpen ? "閉じる" : "開く"}</span>
          </button>

          <div
            id="pixel-lab-controls"
            className={classNames("space-y-4", controlsOpen ? "block" : "hidden", "lg:block")}
          >
            <section className={classNames("bg-[#111218]/82", "p-4")}>
              <h2 className={classNames("mb-3", "text-sm", "font-bold", "text-zinc-100/82")}>
                画像を読み込む
              </h2>
              <ImageSourcePicker
                sourceKind={studio.sourceKind}
                source={studio.source}
                fileError={studio.fileError}
                onSourceKindChange={studio.setSourceKind}
                onUrlChange={studio.setUrl}
                onFileChange={studio.setUploadFile}
              />
            </section>
            <ControlBar
              settings={studio.settings}
              outputEstimate={studio.outputEstimate}
              onSettingChange={studio.setSetting}
            />
            <OutputActions
              apiUrl={studio.result.apiUrl}
              canShareApiUrl={studio.result.canShareApiUrl}
              hasGeneratedImage={Boolean(studio.result.generatedPreviewUrl)}
              copied={studio.copied}
              onCopyApiUrl={studio.copyApiUrl}
              onDownload={studio.downloadResult}
              onReset={studio.reset}
              compact
            />
          </div>
        </aside>

        <main className={classNames("order-1", "flex", "flex-col", "gap-5", "lg:order-2")}>
          <div
            className={classNames(
              "order-1",
              "bg-[#121218]",
              "p-3",
              "shadow-[0_28px_80px_rgba(0,0,0,0.38)]",
              "lg:p-5",
            )}
          >
            <BeforeAfterPreview
              originalImageUrl={studio.result.originalPreviewUrl}
              generatedImageUrl={studio.result.generatedPreviewUrl}
              isLoading={studio.result.isLoading}
              errorMessage={studio.result.errorMessage}
              frameClassName="min-h-[22rem] bg-[#08090d] lg:min-h-[36rem]"
            />
          </div>

          <section
            className={classNames(
              "order-2",
              "grid",
              "gap-3",
              "px-1",
              "text-xs",
              "text-zinc-100/48",
              "sm:grid-cols-4",
            )}
          >
            <p>
              入力 <span className={classNames("text-zinc-100/70")}>{sourceLabel}</span>
            </p>
            <p>
              共有 <span className={classNames("text-zinc-100/70")}>{shareLabel}</span>
            </p>
            <p>
              色数{" "}
              <span className={classNames("text-zinc-100/70")}>{studio.settings.paletteSize}</span>
            </p>
            <p>
              表示効果{" "}
              <span className={classNames("text-zinc-100/70")}>
                {studio.settings.tvEffectEnabled ? "あり" : "なし"}
              </span>
            </p>
          </section>

          <section
            className={classNames("order-3", "space-y-1", "px-1", "text-xs", "text-zinc-100/45")}
          >
            <p>
              粒度 {studio.settings.sampleSize} / 描画ブロック {studio.settings.pixelSize} / 色数{" "}
              {studio.settings.paletteSize}
            </p>
            <p>URL入力なら共有できます。アップロード画像は保存されません。</p>
          </section>
        </main>
      </div>
    </div>
  );
};
