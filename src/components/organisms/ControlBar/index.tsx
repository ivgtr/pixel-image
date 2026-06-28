import classNames from "classnames";
import type { PixelImageSettings } from "../PixelImageStudio/types";
import { estimateOutputScale, tvEffectPresetOptions } from "../PixelImageStudio/types";

type ControlBarProps = {
  settings: PixelImageSettings;
  updateSetting: <T extends keyof PixelImageSettings>(
    key: T,
    value: PixelImageSettings[T],
  ) => void;
  reset: () => void;
  layout?: "panel" | "strip";
};

type SliderFieldProps = {
  id: string;
  label: string;
  description: string;
  value: string;
  min: number;
  max: number;
  onChange: (value: string) => void;
};

const SliderField = ({ id, label, description, value, min, max, onChange }: SliderFieldProps) => {
  const descriptionId = `${id}-description`;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={id} className="text-sm font-bold text-white">
            {label}
          </label>
          <p id={descriptionId} className="mt-1 text-xs leading-relaxed text-slate-400">
            {description}
          </p>
        </div>
        <output htmlFor={id} className="rounded-lg bg-white px-2 py-1 text-sm font-black text-slate-950">
          {value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        aria-describedby={descriptionId}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="mt-4 w-full"
      />
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.16em] text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">{children}</p>
);

export const ControlBar = ({ settings, updateSetting, reset, layout = "panel" }: ControlBarProps) => {
  return (
    <section className={classNames("space-y-4", layout === "strip" ? "lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0" : undefined)}>
      <div className="space-y-3">
        <SectionLabel>Input Sampling</SectionLabel>
        <SliderField
          id="sample-size"
          label="Sample Size"
          description="入力画像を読むマスの細かさ。小さいほど細部を拾います。"
          value={settings.sampleSize}
          min={1}
          max={50}
          onChange={(value) => updateSetting("sampleSize", value)}
        />
      </div>

      <div className="space-y-3">
        <SectionLabel>Pixel Output</SectionLabel>
        <SliderField
          id="pixel-size"
          label="Pixel Size"
          description="出力ドットの大きさ。大きいほど粗く、ドット感が強くなります。"
          value={settings.pixelSize}
          min={1}
          max={50}
          onChange={(value) => updateSetting("pixelSize", value)}
        />
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          Output scale estimate: <strong className="text-white">{estimateOutputScale(settings)}</strong>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Palette</SectionLabel>
        <SliderField
          id="palette-size"
          label="Palette Size"
          description="使用色数。少ないほどゲーム機風、多いほど写真に近づきます。"
          value={settings.paletteSize}
          min={1}
          max={50}
          onChange={(value) => updateSetting("paletteSize", value)}
        />
      </div>

      <div className="space-y-3">
        <SectionLabel>Display Effect</SectionLabel>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <label className="flex items-center justify-between gap-4 text-sm font-bold text-white" htmlFor="tv-effect-enabled">
            TV Effect
            <input
              id="tv-effect-enabled"
              type="checkbox"
              checked={settings.tvEffectEnabled}
              onChange={(event) => updateSetting("tvEffectEnabled", event.currentTarget.checked)}
              className="h-5 w-5"
            />
          </label>
          <p className="mt-1 text-xs text-slate-400">にじみ、走査線、レトロ表示の質感を追加します。</p>

          <div className="mt-4 grid gap-3">
            <label htmlFor="tv-effect-preset" className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Preset
            </label>
            <select
              id="tv-effect-preset"
              value={settings.tvEffectPreset}
              disabled={!settings.tvEffectEnabled}
              onChange={(event) =>
                updateSetting("tvEffectPreset", event.currentTarget.value as PixelImageSettings["tvEffectPreset"])
              }
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white disabled:opacity-50"
            >
              {tvEffectPresetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.hint}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="tv-effect-strength" className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Strength
              </label>
              <output htmlFor="tv-effect-strength" className="text-sm font-bold text-white">
                {settings.tvEffectStrength}
              </output>
            </div>
            <input
              id="tv-effect-strength"
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.tvEffectStrength}
              disabled={!settings.tvEffectEnabled}
              onChange={(event) => updateSetting("tvEffectStrength", event.currentTarget.value)}
              className="mt-3 w-full disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={reset}
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
      >
        Reset
      </button>
    </section>
  );
};
