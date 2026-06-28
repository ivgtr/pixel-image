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
        "bg-[#120e14]",
        "px-4",
        "py-5",
        "text-zinc-100",
        "md:px-6",
      )}
    >
      <div className={classNames("mx-auto", "max-w-[92rem]")}>
        <header
          className={classNames(
            "mb-5",
            "border-y",
            "border-[#a8b89c]/14",
            "py-3",
            "text-[#c7c0b5]",
          )}
        >
          <div
            className={classNames(
              "flex",
              "flex-col",
              "gap-4",
              "md:flex-row",
              "md:items-center",
              "md:justify-between",
            )}
          >
            <div>
              <h1
                className={classNames("text-3xl", "font-black", "leading-none", "text-[#ece7dc]")}
              >
                Pixel Image
              </h1>
              <p className={classNames("mt-2", "text-sm", "text-[#a8b89c]/72")}>image to pixel</p>
            </div>
            <div
              className={classNames(
                "max-w-xl",
                "space-y-2",
                "text-sm",
                "leading-6",
                "text-[#c7c0b5]/66",
                "md:text-right",
              )}
            >
              <p>画像を読み込んで、色数と粒度を調整します。</p>
              <p className={classNames("text-xs", "text-[#a8b89c]/60")}>
                元画像と変換後を比較できます。
              </p>
            </div>
          </div>
        </header>

        <div className={classNames("grid", "gap-6", "lg:grid-cols-[20rem_minmax(0,1fr)]")}>
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
            <button
              type="button"
              onClick={() => setControlsOpen((current) => !current)}
              className={classNames(
                "flex",
                "w-full",
                "items-center",
                "justify-between",
                "bg-[#18131a]/88",
                "px-4",
                "py-3",
                "text-left",
                "text-sm",
                "font-semibold",
                "text-[#ece7dc]/80",
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
              <section
                className={classNames(
                  "bg-[#18131a]/88",
                  "p-4",
                  "shadow-[3px_3px_0_rgba(0,0,0,0.18)]",
                )}
              >
                <h2 className={classNames("mb-3", "text-sm", "font-bold", "text-[#ece7dc]/82")}>
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
            <article
              className={classNames(
                "order-1",
                "bg-[#18141b]",
                "shadow-[0_28px_80px_rgba(0,0,0,0.44),-10px_10px_0_rgba(168,184,156,0.035)]",
              )}
            >
              <div
                className={classNames(
                  "flex",
                  "flex-wrap",
                  "items-center",
                  "justify-between",
                  "gap-2",
                  "border-b",
                  "border-[#a8b89c]/12",
                  "px-3",
                  "py-2",
                  "text-xs",
                  "text-[#c7c0b5]/62",
                  "lg:px-5",
                )}
              >
                <span>No.001 画像を変換する</span>
                <span>{studio.result.isLoading ? "変換中" : "プレビュー"}</span>
              </div>
              <div className={classNames("p-3", "lg:p-5")}>
                <BeforeAfterPreview
                  originalImageUrl={studio.result.originalPreviewUrl}
                  generatedImageUrl={studio.result.generatedPreviewUrl}
                  isLoading={studio.result.isLoading}
                  errorMessage={studio.result.errorMessage}
                  frameClassName="min-h-[22rem] bg-[#09090d] lg:min-h-[36rem]"
                />
              </div>
            </article>

            <section
              className={classNames(
                "order-2",
                "grid",
                "gap-3",
                "px-1",
                "text-xs",
                "text-[#c7c0b5]/50",
                "sm:grid-cols-4",
              )}
            >
              <p>
                入力 <span className={classNames("text-[#ece7dc]/72")}>{sourceLabel}</span>
              </p>
              <p>
                共有 <span className={classNames("text-[#ece7dc]/72")}>{shareLabel}</span>
              </p>
              <p>
                色数{" "}
                <span className={classNames("text-[#ece7dc]/72")}>
                  {studio.settings.paletteSize}
                </span>
              </p>
              <p>
                表示効果{" "}
                <span className={classNames("text-[#ece7dc]/72")}>
                  {studio.settings.tvEffectEnabled ? "あり" : "なし"}
                </span>
              </p>
            </section>

            <section
              className={classNames("order-3", "space-y-1", "px-1", "text-xs", "text-[#c7c0b5]/45")}
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
    </div>
  );
};
