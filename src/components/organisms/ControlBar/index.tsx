import classNames from "classnames";
import React from "react";
import type { TvEffectPreset } from "../../../server/pixelImage/tvEffect/types";
import type { PixelImageSettings } from "../PixelImageStudio/types";

type ControlBarProps = {
  settings: PixelImageSettings;
  outputEstimate: string;
  onSettingChange: <Key extends keyof PixelImageSettings>(
    key: Key,
    value: PixelImageSettings[Key],
  ) => void;
};

const presets = [
  {
    label: "粗いゲーム機",
    sampleSize: "12",
    pixelSize: "20",
    paletteSize: "6",
  },
  {
    label: "標準観察",
    sampleSize: "15",
    pixelSize: "15",
    paletteSize: "8",
  },
  {
    label: "細部を拾う",
    sampleSize: "8",
    pixelSize: "12",
    paletteSize: "14",
  },
];

const ControlSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section className={classNames("space-y-3", "border-t", "border-cyan-200/10", "pt-4")}>
    <h3
      className={classNames(
        "font-mono",
        "text-[0.7rem]",
        "font-bold",
        "uppercase",
        "tracking-[0.18em]",
        "text-cyan-200/70",
      )}
    >
      {label}
    </h3>
    {children}
  </section>
);

const SliderField = ({
  id,
  label,
  value,
  min,
  max,
  help,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  min: number;
  max: number;
  help: string;
  onChange: (value: string) => void;
}) => (
  <label htmlFor={id} className={classNames("block", "space-y-2", "font-mono")}>
    <span className={classNames("flex", "items-center", "justify-between", "gap-3")}>
      <span className={classNames("text-xs", "font-semibold")}>{label}</span>
      <span
        className={classNames(
          "min-w-[3rem]",
          "border",
          "border-cyan-100/15",
          "bg-[#05070b]",
          "px-2",
          "py-1",
          "text-center",
          "text-xs",
          "tabular-nums",
        )}
      >
        {value}
      </span>
    </span>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className={classNames("w-full", "accent-current")}
    />
    <span className={classNames("block", "text-xs", "text-cyan-100/55")}>{help}</span>
  </label>
);

export const ControlBar = ({ settings, outputEstimate, onSettingChange }: ControlBarProps) => {
  return (
    <section
      className={classNames(
        "space-y-5",
        "border",
        "border-cyan-300/20",
        "bg-[#080d12]/90",
        "p-4",
        "text-cyan-50",
      )}
    >
      <div>
        <h2
          className={classNames(
            "font-mono",
            "text-xs",
            "font-bold",
            "uppercase",
            "tracking-[0.16em]",
          )}
        >
          設定端末
        </h2>
        <p className={classNames("mt-1", "font-mono", "text-xs", "text-cyan-100/55")}>
          {outputEstimate}
        </p>
      </div>

      <ControlSection label="preset tags">
        <div className={classNames("grid", "gap-2")}>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onSettingChange("sampleSize", preset.sampleSize);
                onSettingChange("pixelSize", preset.pixelSize);
                onSettingChange("paletteSize", preset.paletteSize);
              }}
              className={classNames(
                "border",
                "border-cyan-200/20",
                "bg-[#05070b]/75",
                "px-3",
                "py-2",
                "text-left",
                "font-mono",
                "text-xs",
                "font-semibold",
                "text-cyan-50",
                "hover:border-cyan-200/60",
                "focus:border-cyan-100",
                "focus:outline-none",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection label="sampling">
        <SliderField
          id="sample-size"
          label="サンプリング"
          min={1}
          max={50}
          value={settings.sampleSize}
          help="小さいほど細部を読みます。"
          onChange={(value) => onSettingChange("sampleSize", value)}
        />
      </ControlSection>

      <ControlSection label="draw block">
        <SliderField
          id="pixel-size"
          label="描画ブロック"
          min={1}
          max={50}
          value={settings.pixelSize}
          help="大きいほどドット感が強くなります。"
          onChange={(value) => onSettingChange("pixelSize", value)}
        />
      </ControlSection>

      <ControlSection label="palette">
        <SliderField
          id="palette-size"
          label="色数"
          min={1}
          max={32}
          value={settings.paletteSize}
          help="少ないほどゲーム機風になります。"
          onChange={(value) => onSettingChange("paletteSize", value)}
        />
      </ControlSection>

      <ControlSection label="display effect">
        <label htmlFor="tv-effect-enabled" className={classNames("flex", "items-center", "gap-3")}>
          <input
            id="tv-effect-enabled"
            type="checkbox"
            checked={settings.tvEffectEnabled}
            onChange={(event) => onSettingChange("tvEffectEnabled", event.currentTarget.checked)}
            className={classNames("h-5", "w-5", "accent-current")}
          />
          <span className={classNames("font-mono", "text-xs", "font-semibold")}>TV表示</span>
        </label>

        <label htmlFor="tv-effect-preset" className={classNames("block", "space-y-1")}>
          <span className={classNames("font-mono", "text-xs", "font-semibold", "uppercase")}>
            preset
          </span>
          <select
            id="tv-effect-preset"
            value={settings.tvEffectPreset}
            onChange={(event) =>
              onSettingChange("tvEffectPreset", event.currentTarget.value as TvEffectPreset)
            }
            className={classNames(
              "w-full",
              "border",
              "border-cyan-100/15",
              "bg-[#05070b]",
              "px-3",
              "py-2",
              "font-mono",
              "text-sm",
              "text-cyan-50",
            )}
          >
            <option value="soft-tv">Soft TV</option>
            <option value="ntsc">NTSC</option>
            <option value="crt">CRT</option>
            <option value="famicom-composite">Famicom Composite</option>
            <option value="sharp-emulator">Sharp Emulator</option>
          </select>
        </label>

        <SliderField
          id="tv-effect-strength"
          label="にじみ"
          min={0}
          max={100}
          value={settings.tvEffectStrength}
          help="走査線と画面のにじみ。"
          onChange={(value) => onSettingChange("tvEffectStrength", value)}
        />
      </ControlSection>
    </section>
  );
};
