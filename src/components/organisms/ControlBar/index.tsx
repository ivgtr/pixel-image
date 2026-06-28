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
  <section className={classNames("space-y-3", "border-t", "border-zinc-100/10", "pt-4")}>
    <h3 className={classNames("text-xs", "font-bold", "text-zinc-100/65")}>{label}</h3>
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
  <label htmlFor={id} className={classNames("block", "space-y-2")}>
    <span className={classNames("flex", "items-center", "justify-between", "gap-3")}>
      <span className={classNames("text-sm", "font-semibold", "text-zinc-100/85")}>{label}</span>
      <span
        className={classNames(
          "min-w-[3rem]",
          "border",
          "border-zinc-100/10",
          "bg-[#101117]",
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
    <span className={classNames("block", "text-xs", "text-zinc-100/50")}>{help}</span>
  </label>
);

export const ControlBar = ({ settings, outputEstimate, onSettingChange }: ControlBarProps) => {
  return (
    <section
      className={classNames(
        "space-y-5",
        "border",
        "border-zinc-100/10",
        "bg-[#101117]/85",
        "p-4",
        "text-zinc-100",
      )}
    >
      <div>
        <h2 className={classNames("text-sm", "font-bold")}>変換設定</h2>
        <p className={classNames("mt-1", "text-xs", "text-zinc-100/45")}>{outputEstimate}</p>
      </div>

      <ControlSection label="プリセット">
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
                "border-zinc-100/10",
                "bg-[#0c0d12]",
                "px-3",
                "py-2",
                "text-left",
                "text-sm",
                "font-semibold",
                "text-zinc-100/80",
                "hover:border-zinc-100/25",
                "focus:border-zinc-100/45",
                "focus:outline-none",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection label="粒度">
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

      <ControlSection label="描画">
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

      <ControlSection label="色">
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

      <ControlSection label="表示効果">
        <label htmlFor="tv-effect-enabled" className={classNames("flex", "items-center", "gap-3")}>
          <input
            id="tv-effect-enabled"
            type="checkbox"
            checked={settings.tvEffectEnabled}
            onChange={(event) => onSettingChange("tvEffectEnabled", event.currentTarget.checked)}
            className={classNames("h-5", "w-5", "accent-current")}
          />
          <span className={classNames("text-sm", "font-semibold")}>TV表示</span>
        </label>

        <label htmlFor="tv-effect-preset" className={classNames("block", "space-y-1")}>
          <span className={classNames("text-xs", "font-semibold")}>種類</span>
          <select
            id="tv-effect-preset"
            value={settings.tvEffectPreset}
            onChange={(event) =>
              onSettingChange("tvEffectPreset", event.currentTarget.value as TvEffectPreset)
            }
            className={classNames(
              "w-full",
              "border",
              "border-zinc-100/10",
              "bg-[#101117]",
              "px-3",
              "py-2",
              "text-sm",
              "text-zinc-100",
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
