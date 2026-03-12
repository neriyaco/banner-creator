import { useRef, useState } from 'react';
import type { BannerConfig } from '../types';
import { X, Upload, Trash2 } from 'lucide-react';
import { useCustomIcons } from '../hooks/useCustomIcons';
import { useI18nContext } from '../i18n/i18n-react';

// ── helpers ────────────────────────────────────────────────────────────────

function isDataUrl(v: string) {
  return v.startsWith('data:');
}

/** Renders an emoji or an uploaded-image preview. */
function IconPreview({ value, size = 28 }: { value: string; size?: number }) {
  if (!value) return null;
  if (isDataUrl(value))
    return (
      <img
        src={value}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4 }}
      />
    );
  return <span style={{ fontSize: size, lineHeight: 1 }}>{value}</span>;
}

// ── emoji icon data ─────────────────────────────────────────────────────────

const ICON_EMOJI_GROUPS = [
  { key: 'celebration' as const, icons: ['🎉','🎊','🎈','🎁','🥂','🍾','🎂','🕯️','🎆','🎇'] },
  { key: 'stars'       as const, icons: ['⭐','🌟','✨','💫','🌙','☀️','🌈','❄️','⚡','🌊'] },
  { key: 'hearts'      as const, icons: ['❤️','💙','💚','💛','🧡','💜','🖤','🤍','💖','💝'] },
  { key: 'nature'      as const, icons: ['🌸','🌺','🌻','🌹','🍀','🌿','🦋','🐝','🌱','🍃'] },
  { key: 'symbols'     as const, icons: ['👑','🔥','💎','🏆','🎵','🎶','🎯','🎨','⚜️','🔑'] },
  { key: 'flag'        as const, icons: ['✡️','🕎','📖','🕊️','🌿','🍇','🫒','🌾','🏺','🔯'] },
  { key: 'smileys'     as const, icons: ['😊','🥳','😍','🤩','😎','🦁','🦅','🦄','🐉','🦊'] },
];

// ── SideSelector ───────────────────────────────────────────────────────────

interface SideSelectorProps {
  label: string;
  value: string;
  onSelect: (icon: string) => void;
  onClear: () => void;
}

function SideSelector({ label, value, onSelect, onClear }: SideSelectorProps) {
  const { LL } = useI18nContext();
  const [activeGroup, setActiveGroup] = useState(0);

  const ICON_GROUPS = ICON_EMOJI_GROUPS.map((g) => ({
    label: LL.icons.groups[g.key](),
    icons: g.icons,
  }));

  return (
    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <span className="section-title" style={{ marginBottom: 0 }}>{label}</span>
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <IconPreview value={value} size={28} />
              <button
                onClick={onClear}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title={LL.icons.removeIcon()}
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-500">{LL.icons.noIcon()}</span>
          )}
        </div>
      </div>

      {/* Emoji group tabs */}
      <div className="flex gap-1 flex-wrap mb-2">
        {ICON_GROUPS.map((g, i) => (
          <button
            key={g.label}
            onClick={() => setActiveGroup(i)}
            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
              activeGroup === i
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1">
        {ICON_GROUPS[activeGroup].icons.map((icon) => (
          <button
            key={icon}
            onClick={() => onSelect(icon)}
            className={`text-xl flex items-center justify-center h-9 rounded transition-colors ${
              value === icon
                ? 'bg-indigo-600/40 ring-1 ring-indigo-500'
                : 'hover:bg-slate-700'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── main panel ─────────────────────────────────────────────────────────────

interface Props {
  config: BannerConfig;
  onChange: (p: Partial<BannerConfig>) => void;
}

export default function IconPanel({ config, onChange }: Props) {
  const { LL } = useI18nContext();
  const { icons, addIcon, removeIcon } = useCustomIcons();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await addIcon(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Uploaded image library ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="section-title" style={{ marginBottom: 0 }}>{LL.icons.customImages()}</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Upload size={12} />
            {uploading ? LL.icons.uploading() : LL.icons.uploadImage()}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {icons.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4 rounded-lg border border-dashed border-slate-700">
            {LL.icons.noImages()}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {icons.map((icon) => (
              <div
                key={icon.id}
                className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800"
              >
                <img
                  src={icon.dataUrl}
                  alt={icon.name}
                  className="w-full aspect-square object-contain p-1"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                  <button
                    onClick={() => onChange({ rightIcon: icon.dataUrl })}
                    className={`w-14 text-xs py-0.5 rounded font-semibold transition-colors ${
                      config.rightIcon === icon.dataUrl
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-600 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    {LL.icons.right()}
                  </button>
                  <button
                    onClick={() => onChange({ leftIcon: icon.dataUrl })}
                    className={`w-14 text-xs py-0.5 rounded font-semibold transition-colors ${
                      config.leftIcon === icon.dataUrl
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-600 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    {LL.icons.left()}
                  </button>
                  <button
                    onClick={() => {
                      removeIcon(icon.id);
                      if (config.rightIcon === icon.dataUrl) onChange({ rightIcon: '' });
                      if (config.leftIcon === icon.dataUrl) onChange({ leftIcon: '' });
                    }}
                    className="text-red-400 hover:text-red-300 mt-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Emoji selectors ── */}
      <SideSelector
        label={LL.icons.rightIcon()}
        value={config.rightIcon}
        onSelect={(icon) => onChange({ rightIcon: icon })}
        onClear={() => onChange({ rightIcon: '' })}
      />

      <SideSelector
        label={LL.icons.leftIcon()}
        value={config.leftIcon}
        onSelect={(icon) => onChange({ leftIcon: icon })}
        onClear={() => onChange({ leftIcon: '' })}
      />

      {/* ── Icon size ── */}
      <div>
        <label className="panel-label flex justify-between">
          <span className="section-title" style={{ marginBottom: 0 }}>{LL.icons.iconSize()}</span>
          <span className="text-indigo-400 font-mono">{config.iconSize}px</span>
        </label>
        <input
          type="range"
          min={16}
          max={200}
          value={config.iconSize}
          onChange={(e) => onChange({ iconSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* ── Icon offset ── */}
      <div>
        <label className="panel-label flex justify-between">
          <span className="section-title" style={{ marginBottom: 0 }}>{LL.icons.iconOffset()}</span>
          <span className="text-indigo-400 font-mono">{config.iconOffset}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={50}
          value={config.iconOffset}
          onChange={(e) => onChange({ iconOffset: Number(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-0.5" style={{ direction: 'ltr' }}>
          <span>{LL.icons.offsetEdge()}</span>
          <span>{LL.icons.offsetCenter()}</span>
        </div>
      </div>
    </div>
  );
}
