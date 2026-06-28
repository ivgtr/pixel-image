import classNames from "classnames";
import { useState } from "react";
import type { ComparisonMode } from "../PixelImageStudio/types";

type BeforeAfterPreviewProps = {
  originalPreviewUrl: string | undefined;
  generatedPreviewUrl: string | undefined;
  isLoading: boolean;
  errorMessage: string | undefined;
  comparisonMode: ComparisonMode;
  frameLabel?: string;
  className?: string;
};

const imageFrameClass = classNames(
  "relative",
  "min-h-[280px]",
  "overflow-hidden",
  "rounded-2xl",
  "border",
  "border-white/15",
  "bg-black/40",
);

const PreviewImage = ({
  src,
  alt,
  emptyLabel,
}: {
  src: string | undefined;
  alt: string;
  emptyLabel: string;
}) => {
  if (!src) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center px-6 text-center text-sm text-slate-400">
        {emptyLabel}
      </div>
    );
  }

  return <img src={src} alt={alt} className="h-full min-h-[280px] w-full object-contain" />;
};

const PanelLabel = ({ children }: { children: string }) => (
  <span className="absolute left-3 top-3 z-10 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
    {children}
  </span>
);

export const BeforeAfterPreview = ({
  originalPreviewUrl,
  generatedPreviewUrl,
  isLoading,
  errorMessage,
  comparisonMode,
  frameLabel = "Before / After",
  className,
}: BeforeAfterPreviewProps) => {
  const [splitPosition, setSplitPosition] = useState("50");
  const [toggleView, setToggleView] = useState<"before" | "after">("after");

  const overlay = (
    <>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 text-sm font-semibold tracking-[0.2em] text-white">
          CONVERTING...
        </div>
      )}
      {errorMessage && (
        <div
          role="alert"
          className="absolute inset-x-4 bottom-4 z-30 rounded-xl border border-red-400/50 bg-red-950/90 px-4 py-3 text-sm text-red-100"
        >
          {errorMessage}
        </div>
      )}
    </>
  );

  if (comparisonMode === "split") {
    return (
      <section className={classNames("space-y-3", className)} aria-label={frameLabel}>
        <div className={imageFrameClass}>
          <PanelLabel>Split Compare</PanelLabel>
          <div className="absolute inset-0">
            <PreviewImage
              src={originalPreviewUrl}
              alt="Original source image"
              emptyLabel="Before画像を待機中"
            />
          </div>
          <div
            className="absolute inset-0 overflow-hidden border-r-2 border-white/80"
            style={{ clipPath: `inset(0 ${100 - Number(splitPosition)}% 0 0)` }}
          >
            <PreviewImage
              src={generatedPreviewUrl}
              alt="Generated pixel image"
              emptyLabel="After画像を待機中"
            />
          </div>
          {overlay}
        </div>
        <label className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-300">
          Before
          <input
            type="range"
            min="0"
            max="100"
            value={splitPosition}
            onChange={(event) => setSplitPosition(event.currentTarget.value)}
            className="w-full"
            aria-label="Before After split position"
          />
          After
        </label>
      </section>
    );
  }

  if (comparisonMode === "toggle") {
    const activeSrc = toggleView === "before" ? originalPreviewUrl : generatedPreviewUrl;
    const emptyLabel = toggleView === "before" ? "Before画像を待機中" : "After画像を待機中";

    return (
      <section className={classNames("space-y-4", className)} aria-label={frameLabel}>
        <div className="flex justify-center gap-2">
          {(["before", "after"] as const).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={toggleView === view}
              onClick={() => setToggleView(view)}
              className={classNames(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]",
                toggleView === view
                  ? "border-amber-300 bg-amber-300 text-slate-950"
                  : "border-white/20 bg-white/5 text-white hover:bg-white/10",
              )}
            >
              {view === "before" ? "Before" : "After"}
            </button>
          ))}
        </div>
        <div className={imageFrameClass}>
          <PanelLabel>{toggleView === "before" ? "Original" : "Pixelated"}</PanelLabel>
          <PreviewImage
            src={activeSrc}
            alt={toggleView === "before" ? "Original source image" : "Generated pixel image"}
            emptyLabel={emptyLabel}
          />
          {overlay}
        </div>
      </section>
    );
  }

  if (comparisonMode === "stacked") {
    return (
      <section className={classNames("grid gap-4", className)} aria-label={frameLabel}>
        <div className={imageFrameClass}>
          <PanelLabel>Before</PanelLabel>
          <PreviewImage src={originalPreviewUrl} alt="Original source image" emptyLabel="Before画像を待機中" />
        </div>
        <div className={imageFrameClass}>
          <PanelLabel>After</PanelLabel>
          <PreviewImage src={generatedPreviewUrl} alt="Generated pixel image" emptyLabel="After画像を待機中" />
          {overlay}
        </div>
      </section>
    );
  }

  return (
    <section className={classNames("grid gap-4 lg:grid-cols-2", className)} aria-label={frameLabel}>
      <div className={imageFrameClass}>
        <PanelLabel>Before</PanelLabel>
        <PreviewImage src={originalPreviewUrl} alt="Original source image" emptyLabel="Before画像を待機中" />
      </div>
      <div className={imageFrameClass}>
        <PanelLabel>After</PanelLabel>
        <PreviewImage src={generatedPreviewUrl} alt="Generated pixel image" emptyLabel="After画像を待機中" />
        {overlay}
      </div>
    </section>
  );
};
