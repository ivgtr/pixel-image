import classNames from "classnames";
import React, { useState } from "react";
import { BeforeAfterPreview } from "../../BeforeAfterPreview";
import { ControlBar } from "../../ControlBar";
import { ImageSourcePicker } from "../../ImageSourcePicker";
import { OutputActions } from "../../OutputActions";
import type { PixelImageStudioState } from "../types";

export const PixelLabVariant = ({ studio }: { studio: PixelImageStudioState }) => {
  const sourceLabel = studio.sourceKind === "url" ? "Remote URL" : "Local upload";
  const shareLabel = studio.result.canShareApiUrl ? "Shareable" : "Local only";
  const [controlsOpen, setControlsOpen] = useState(false);
  const logLines = [
    `source: ${sourceLabel}`,
    `sample: ${studio.settings.sampleSize}px`,
    `block: ${studio.settings.pixelSize}px`,
    `colors: ${studio.settings.paletteSize}`,
    `status: ${studio.status}`,
  ];

  return (
    <div
      className={classNames(
        "min-h-screen",
        "bg-[#06070d]",
        "bg-[linear-gradient(rgba(103,232,249,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.045)_1px,transparent_1px)]",
        "bg-[size:22px_22px]",
        "px-4",
        "py-4",
        "text-cyan-50",
        "md:px-6",
      )}
    >
      <div
        className={classNames(
          "mx-auto",
          "grid",
          "max-w-[92rem]",
          "gap-5",
          "lg:grid-cols-[23rem_minmax(0,1fr)]",
        )}
      >
        <aside
          className={classNames(
            "order-2",
            "space-y-4",
            "lg:order-1",
            "lg:sticky",
            "lg:top-4",
            "lg:self-start",
          )}
        >
          <header
            className={classNames(
              "border",
              "border-cyan-300/20",
              "bg-[#080d12]/95",
              "p-4",
              "shadow-[4px_4px_0_rgba(244,194,214,0.12)]",
            )}
          >
            <div className={classNames("flex", "items-start", "justify-between", "gap-3")}>
              <div>
                <div className={classNames("mb-2", "flex", "items-center", "gap-2")}>
                  <span className={classNames("h-2", "w-2", "bg-emerald-300")} />
                  <p
                    className={classNames(
                      "font-mono",
                      "text-xs",
                      "uppercase",
                      "tracking-[0.22em]",
                      "text-cyan-100/70",
                    )}
                  >
                    pixel-image/wiki
                  </p>
                </div>
                <h1 className={classNames("text-2xl", "font-black", "leading-tight")}>
                  深夜のドット絵作業台
                </h1>
              </div>
              <span
                className={classNames(
                  "border",
                  "border-cyan-200/20",
                  "bg-[#05070b]",
                  "px-2",
                  "py-1",
                  "font-mono",
                  "text-xs",
                  "font-bold",
                  "uppercase",
                )}
              >
                {studio.status}
              </span>
            </div>
            <p className={classNames("mt-3", "text-sm", "leading-6", "text-cyan-100/65")}>
              画像を読み込み、サンプリングと色数を調整して、変換後の見え方を比べます。
            </p>
            <div className={classNames("mt-3", "flex", "flex-wrap", "gap-2", "font-mono")}>
              {["#pixel-art", "#before-after", "#api-url"].map((tag) => (
                <span
                  key={tag}
                  className={classNames(
                    "border",
                    "border-cyan-100/15",
                    "bg-[#05070b]",
                    "px-2",
                    "py-1",
                    "text-[0.68rem]",
                    "text-cyan-100/65",
                  )}
                >
                  {tag}
                </span>
              ))}
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
              "border",
              "border-cyan-300/20",
              "bg-[#080d12]/95",
              "px-4",
              "py-3",
              "text-left",
              "text-sm",
              "font-bold",
              "uppercase",
              "tracking-[0.14em]",
              "text-cyan-50",
              "lg:hidden",
            )}
            aria-expanded={controlsOpen}
            aria-controls="pixel-lab-controls"
          >
            <span>設定を開く</span>
            <span className={classNames("font-mono")}>{controlsOpen ? "[close]" : "[open]"}</span>
          </button>

          <div
            id="pixel-lab-controls"
            className={classNames("space-y-4", controlsOpen ? "block" : "hidden", "lg:block")}
          >
            <div className={classNames("border", "border-cyan-300/20", "bg-[#080d12]/90", "p-4")}>
              <h2
                className={classNames(
                  "mb-3",
                  "text-xs",
                  "font-bold",
                  "uppercase",
                  "tracking-[0.18em]",
                  "text-cyan-200/70",
                )}
              >
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
            </div>
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

        <main className={classNames("order-1", "flex", "flex-col", "gap-4", "lg:order-2")}>
          <section
            className={classNames(
              "order-2",
              "grid",
              "gap-2",
              "border",
              "border-cyan-300/20",
              "bg-[#080d12]/90",
              "p-3",
              "font-mono",
              "text-xs",
              "text-cyan-100/75",
              "sm:grid-cols-4",
              "lg:order-1",
            )}
          >
            <div>
              <span className={classNames("block", "uppercase", "tracking-[0.16em]", "opacity-60")}>
                source
              </span>
              <span className={classNames("font-semibold")}>{sourceLabel}</span>
            </div>
            <div>
              <span className={classNames("block", "uppercase", "tracking-[0.16em]", "opacity-60")}>
                artifact
              </span>
              <span className={classNames("font-semibold")}>{shareLabel}</span>
            </div>
            <div>
              <span className={classNames("block", "uppercase", "tracking-[0.16em]", "opacity-60")}>
                palette
              </span>
              <span className={classNames("font-semibold")}>
                {studio.settings.paletteSize} colors
              </span>
            </div>
            <div>
              <span className={classNames("block", "uppercase", "tracking-[0.16em]", "opacity-60")}>
                tv
              </span>
              <span className={classNames("font-semibold")}>
                {studio.settings.tvEffectEnabled ? studio.settings.tvEffectPreset : "Off"}
              </span>
            </div>
          </section>

          <div
            className={classNames(
              "order-1",
              "border",
              "border-cyan-300/20",
              "bg-[linear-gradient(rgba(103,232,249,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.08)_1px,transparent_1px)]",
              "bg-[size:18px_18px]",
              "p-2",
              "lg:order-2",
              "lg:p-3",
            )}
          >
            <BeforeAfterPreview
              originalImageUrl={studio.result.originalPreviewUrl}
              generatedImageUrl={studio.result.generatedPreviewUrl}
              isLoading={studio.result.isLoading}
              errorMessage={studio.result.errorMessage}
              frameClassName="min-h-[22rem] border border-cyan-200/20 bg-[#080d12] lg:min-h-[36rem]"
            />
          </div>
          <section
            className={classNames(
              "order-3",
              "grid",
              "gap-3",
              "border",
              "border-cyan-300/20",
              "bg-[#080d12]/90",
              "p-3",
              "font-mono",
              "text-xs",
              "text-cyan-100/70",
              "md:grid-cols-[1fr_1fr]",
            )}
          >
            <div>
              <h2 className={classNames("mb-2", "font-bold", "uppercase", "tracking-[0.16em]")}>
                処理ログ
              </h2>
              <ol className={classNames("space-y-1")}>
                {logLines.map((line) => (
                  <li key={line} className={classNames("text-cyan-100/60")}>
                    &gt; {line}
                  </li>
                ))}
              </ol>
            </div>
            <div
              className={classNames(
                "border-t",
                "border-cyan-100/10",
                "pt-3",
                "md:border-l",
                "md:border-t-0",
                "md:pl-3",
                "md:pt-0",
              )}
            >
              <h2 className={classNames("mb-2", "font-bold", "uppercase", "tracking-[0.16em]")}>
                出力メモ
              </h2>
              <p className={classNames("text-cyan-100/60")}>{studio.outputEstimate}</p>
              <p className={classNames("mt-2", "text-cyan-100/45")}>
                URL入力なら貼れるAPI URLを作成。Uploadはこの画面だけで処理します。
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
