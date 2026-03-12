import type { BannerConfig } from '../types';
import { useI18nContext } from '../i18n/i18n-react';

const PRESETS = [{ label: 'תת ניק', w: 169, h: 39 }];

interface Props {
  config: BannerConfig;
  onChange: (p: Partial<BannerConfig>) => void;
}

function NumInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="panel-label flex justify-between">
        <span className="section-title" style={{ marginBottom: 0 }}>
          {label}
        </span>
        <span className="text-indigo-400 font-mono">{value}px</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="control-input ltr mt-1"
      />
    </div>
  );
}

export default function SizePanel({ config, onChange }: Props) {
  const { LL } = useI18nContext();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="section-title">{LL.size.presets()}</span>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange({ width: p.w, height: p.h })}
              className={`text-xs text-right px-3 py-2 rounded border transition-colors ${
                config.width === p.w && config.height === p.h
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
              }`}
            >
              <span className="font-semibold">{p.label}</span>
              <span className="text-slate-500 mr-2">
                {p.w}×{p.h}
              </span>
            </button>
          ))}
        </div>
      </div>

      <NumInput
        label={LL.size.width()}
        value={config.width}
        min={200}
        max={3000}
        onChange={(v) => onChange({ width: v })}
      />

      <NumInput
        label={LL.size.height()}
        value={config.height}
        min={50}
        max={2000}
        onChange={(v) => onChange({ height: v })}
      />

      <div>
        <label className="panel-label flex justify-between">
          <span className="section-title" style={{ marginBottom: 0 }}>
            {LL.size.borderRadius()}
          </span>
          <span className="text-indigo-400 font-mono">{config.borderRadius}px</span>
        </label>
        <input
          type="range"
          min={0}
          max={200}
          value={config.borderRadius}
          onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
