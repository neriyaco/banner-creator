import type { BannerConfig, GradientConfig, GradientStop } from '../types';
import { cssGradient } from '../utils';
import { Plus, Trash2 } from 'lucide-react';
import { useI18nContext } from '../i18n/i18n-react';

interface Props {
  config: BannerConfig;
  onChange: (p: Partial<BannerConfig>) => void;
}

let stopCounter = 100;
function uid() {
  return String(++stopCounter);
}

export default function BackgroundPanel({ config, onChange }: Props) {
  const { LL } = useI18nContext();
  const isSolid = config.background.type === 'solid';
  const isGradient = config.background.type === 'gradient';

  function setSolid() {
    const prev = config.background;
    onChange({
      background: {
        type: 'solid',
        color: prev.type === 'solid' ? prev.color : '#6366f1',
      },
    });
  }

  function setGradient() {
    const prev = config.background;
    onChange({
      background: {
        type: 'gradient',
        gradient:
          prev.type === 'gradient'
            ? prev.gradient
            : {
                type: 'linear',
                angle: 135,
                stops: [
                  { id: uid(), color: '#667eea', position: 0 },
                  { id: uid(), color: '#764ba2', position: 100 },
                ],
              },
      },
    });
  }

  function setSolidColor(color: string) {
    onChange({ background: { type: 'solid', color } });
  }

  function updateGradientType(type: 'linear' | 'radial') {
    if (config.background.type !== 'gradient') return;
    const g = config.background.gradient;
    onChange({
      background: {
        type: 'gradient',
        gradient:
          type === 'linear'
            ? { type: 'linear', angle: 'angle' in g ? g.angle : 135, stops: g.stops }
            : { type: 'radial', shape: 'ellipse', stops: g.stops },
      },
    });
  }

  function updateAngle(angle: number) {
    if (config.background.type !== 'gradient') return;
    if (config.background.gradient.type !== 'linear') return;
    onChange({
      background: {
        type: 'gradient',
        gradient: { ...config.background.gradient, angle },
      },
    });
  }

  function updateRadialShape(shape: 'circle' | 'ellipse') {
    if (config.background.type !== 'gradient') return;
    if (config.background.gradient.type !== 'radial') return;
    onChange({
      background: {
        type: 'gradient',
        gradient: { ...config.background.gradient, shape },
      },
    });
  }

  function updateStop(id: string, patch: Partial<GradientStop>) {
    if (config.background.type !== 'gradient') return;
    const g = config.background.gradient;
    onChange({
      background: {
        type: 'gradient',
        gradient: {
          ...g,
          stops: g.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        },
      },
    });
  }

  function addStop() {
    if (config.background.type !== 'gradient') return;
    const g = config.background.gradient;
    const sorted = [...g.stops].sort((a, b) => a.position - b.position);
    // Insert after second-to-last stop
    const midPos =
      sorted.length >= 2
        ? Math.round((sorted[sorted.length - 2].position + sorted[sorted.length - 1].position) / 2)
        : 50;
    onChange({
      background: {
        type: 'gradient',
        gradient: { ...g, stops: [...g.stops, { id: uid(), color: '#ffffff', position: midPos }] },
      },
    });
  }

  function removeStop(id: string) {
    if (config.background.type !== 'gradient') return;
    const g = config.background.gradient;
    if (g.stops.length <= 2) return;
    onChange({
      background: {
        type: 'gradient',
        gradient: { ...g, stops: g.stops.filter((s) => s.id !== id) },
      },
    });
  }

  const sortedStops =
    isGradient && config.background.type === 'gradient'
      ? [...config.background.gradient.stops].sort((a, b) => a.position - b.position)
      : [];

  // Extract gradient properties into local variables to preserve TypeScript narrowing inside callbacks
  const activeGradient: GradientConfig | null =
    config.background.type === 'gradient' ? config.background.gradient : null;
  const gradientType = activeGradient?.type ?? null;
  const gradientAngle = activeGradient?.type === 'linear' ? activeGradient.angle : null;
  const gradientShape = activeGradient?.type === 'radial' ? activeGradient.shape : null;

  const gradientPreview =
    isGradient && config.background.type === 'gradient'
      ? cssGradient(config.background.gradient)
      : '';

  return (
    <div className="flex flex-col gap-5">
      {/* Type toggle */}
      <div>
        <span className="section-title">{LL.background.type()}</span>
        <div className="flex gap-2">
          <button
            onClick={setSolid}
            className={`flex-1 py-2 text-sm font-semibold rounded border transition-colors ${
              isSolid
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
            }`}
          >
            {LL.background.solid()}
          </button>
          <button
            onClick={setGradient}
            className={`flex-1 py-2 text-sm font-semibold rounded border transition-colors ${
              isGradient
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
            }`}
          >
            {LL.background.gradient()}
          </button>
        </div>
      </div>

      {/* ── Solid color ── */}
      {isSolid && config.background.type === 'solid' && (
        <div>
          <span className="section-title">{LL.background.color()}</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.background.color}
              onChange={(e) => setSolidColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.background.color}
              onChange={(e) => setSolidColor(e.target.value)}
              className="control-input ltr"
            />
          </div>
        </div>
      )}

      {/* ── Gradient editor ── */}
      {isGradient && config.background.type === 'gradient' && (
        <>
          {/* Gradient type */}
          <div>
            <span className="section-title">{LL.background.gradientType()}</span>
            <div className="flex gap-2">
              {(['linear', 'radial'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateGradientType(t)}
                  className={`flex-1 py-1.5 text-sm rounded border transition-colors ${
                    gradientType === t
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {t === 'linear' ? LL.background.linear() : LL.background.radial()}
                </button>
              ))}
            </div>
          </div>

          {/* Angle (linear only) */}
          {gradientType === 'linear' && (
            <div>
              <label className="panel-label flex justify-between">
                <span className="section-title" style={{ marginBottom: 0 }}>
                  {LL.background.angle()}
                </span>
                <span className="text-indigo-400 font-mono">{gradientAngle}°</span>
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={gradientAngle ?? 0}
                onChange={(e) => updateAngle(Number(e.target.value))}
                className="w-full"
              />
              {/* Quick angle presets */}
              <div className="flex gap-1 mt-1 flex-wrap">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                  <button
                    key={a}
                    onClick={() => updateAngle(a)}
                    className={`px-1.5 py-0.5 text-xs rounded border transition-colors ${
                      gradientAngle === a
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    {a}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Radial shape */}
          {gradientType === 'radial' && (
            <div>
              <span className="section-title">{LL.background.shape()}</span>
              <div className="flex gap-2">
                {(['circle', 'ellipse'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateRadialShape(s)}
                    className={`flex-1 py-1.5 text-sm rounded border transition-colors ${
                      gradientShape === s
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {s === 'circle' ? LL.background.circle() : LL.background.ellipse()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gradient preview strip */}
          <div
            className="h-8 rounded-lg w-full shadow-inner"
            style={{ background: gradientPreview }}
          />

          {/* Color stops */}
          <div>
            <span className="section-title">{LL.background.colorStops()}</span>
            <div className="flex flex-col gap-3">
              {sortedStops.map((stop) => (
                <div
                  key={stop.id}
                  className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                      className="control-input ltr flex-1 text-xs"
                    />
                    <button
                      onClick={() => removeStop(stop.id)}
                      disabled={
                        config.background.type === 'gradient' &&
                        config.background.gradient.stops.length <= 2
                      }
                      className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-indigo-400 font-mono text-xs w-8 shrink-0 text-center">
                      {stop.position}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addStop}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-indigo-400 border border-dashed border-slate-600 hover:border-indigo-500 rounded-lg transition-colors"
            >
              <Plus size={14} />
              {LL.background.addStop()}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
