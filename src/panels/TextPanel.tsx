import type { BannerConfig } from '../types';
import { useI18nContext } from '../i18n/i18n-react';

const FONTS = [
  'Heebo',
  'Rubik',
  'Assistant',
  'Varela Round',
  'Frank Ruhl Libre',
  'Noto Serif Hebrew',
  'Secular One',
  'Suez One',
  'David Libre',
  'Alef',
];

const WEIGHT_VALUES = ['300', '400', '600', '700', '900'] as const;

interface Props {
  config: BannerConfig;
  onChange: (p: Partial<BannerConfig>) => void;
}

export default function TextPanel({ config, onChange }: Props) {
  const { LL } = useI18nContext();

  const WEIGHTS = [
    { label: LL.text.weights.thin(), value: '300' },
    { label: LL.text.weights.regular(), value: '400' },
    { label: LL.text.weights.medium(), value: '600' },
    { label: LL.text.weights.bold(), value: '700' },
    { label: LL.text.weights.black(), value: '900' },
  ] satisfies { label: string; value: (typeof WEIGHT_VALUES)[number] }[];

  return (
    <div className="flex flex-col gap-5">
      {/* Text content */}
      <div>
        <span className="section-title">{LL.text.content()}</span>
        <textarea
          value={config.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          placeholder={LL.text.placeholder()}
          className="control-input resize-none"
          style={{ fontFamily: `'${config.fontFamily}', sans-serif` }}
        />
        <p className="text-xs text-slate-500 mt-1">{LL.text.newlineHint()}</p>
      </div>

      {/* Font family */}
      <div>
        <span className="section-title">{LL.text.font()}</span>
        <select
          value={config.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="control-input"
          style={{ fontFamily: `'${config.fontFamily}', sans-serif` }}
        >
          {FONTS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>
              {f}
            </option>
          ))}
        </select>
        <div
          className="mt-2 p-2 rounded bg-slate-800 text-center text-slate-200 text-sm truncate"
          style={{
            fontFamily: `'${config.fontFamily}', sans-serif`,
            fontWeight: config.fontWeight,
          }}
        >
          אבגדהוזחטי — ABCDEF
        </div>
      </div>

      {/* Font weight */}
      <div>
        <span className="section-title">{LL.text.fontWeight()}</span>
        <div className="flex gap-1 flex-wrap">
          {WEIGHTS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ fontWeight: value })}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                config.fontWeight === value
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
              }`}
              style={{ fontWeight: value }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <label className="panel-label flex justify-between">
          <span className="section-title" style={{ marginBottom: 0 }}>
            {LL.text.fontSize()}
          </span>
          <span className="text-indigo-400 font-mono">{config.fontSize}px</span>
        </label>
        <input
          type="range"
          min={12}
          max={300}
          value={config.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Text color */}
      <div>
        <span className="section-title">{LL.text.textColor()}</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={config.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="control-input ltr"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Letter spacing */}
      <div>
        <label className="panel-label flex justify-between">
          <span className="section-title" style={{ marginBottom: 0 }}>
            {LL.text.letterSpacing()}
          </span>
          <span className="text-indigo-400 font-mono">{config.letterSpacing}px</span>
        </label>
        <input
          type="range"
          min={-5}
          max={30}
          value={config.letterSpacing}
          onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Line height */}
      <div>
        <label className="panel-label flex justify-between">
          <span className="section-title" style={{ marginBottom: 0 }}>
            {LL.text.lineHeight()}
          </span>
          <span className="text-indigo-400 font-mono">{config.lineHeight.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={0.8}
          max={3}
          step={0.1}
          value={config.lineHeight}
          onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Text shadow */}
      <div className="flex items-center justify-between">
        <span className="section-title" style={{ marginBottom: 0 }}>
          {LL.text.textShadow()}
        </span>
        <button
          onClick={() => onChange({ textShadow: !config.textShadow })}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            config.textShadow ? 'bg-indigo-600' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
              config.textShadow ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
