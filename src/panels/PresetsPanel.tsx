import { useRef, useState } from 'react';
import type { BannerConfig } from '../types';
import { usePresets } from '../hooks/usePresets';
import { downloadPresetJson, parsePresetJson } from '../utils';
import { Save, Download, FileDown, Trash2, Upload, FileJson } from 'lucide-react';
import { useI18nContext } from '../i18n/i18n-react';

interface Props {
  config: BannerConfig;
  onLoad: (config: BannerConfig) => void;
}

function formatDate(ts: number, dateLocale: string) {
  return new Date(ts).toLocaleDateString(dateLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PresetsPanel({ config, onLoad }: Props) {
  const { LL } = useI18nContext();
  const { presets, savePreset, deletePreset } = usePresets();

  // Save
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  // Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteJson, setPasteJson] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  async function handleSave() {
    const name = saveName.trim();
    if (!name) return;
    setSaving(true);
    await savePreset(name, config);
    setSaveName('');
    setSaving(false);
  }

  function flashSuccess(msg: string) {
    setImportError('');
    setImportSuccess(msg);
    setTimeout(() => setImportSuccess(''), 3000);
  }

  async function applyImport(json: string, source: string) {
    setImportError('');
    try {
      const { config: imported, name } = parsePresetJson(json);
      await savePreset(name, imported);
      onLoad(imported);
      setPasteJson('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      flashSuccess(LL.presets.importedFrom({ name, source }));
    } catch (e) {
      setImportError(e instanceof Error ? e.message : LL.presets.importError());
    }
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await applyImport(text, LL.presets.fileSource());
  }

  async function handlePasteImport() {
    await applyImport(pasteJson, LL.presets.textSource());
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Save current settings ── */}
      <div>
        <span className="section-title">{LL.presets.saveTitle()}</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={LL.presets.namePlaceholder()}
            className="control-input flex-1"
          />
          <button
            onClick={handleSave}
            disabled={!saveName.trim() || saving}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <Save size={14} />
            {LL.presets.save()}
          </button>
        </div>
      </div>

      {/* ── Saved presets list ── */}
      <div>
        <span className="section-title">{LL.presets.savedTitle({ count: presets.length })}</span>

        {presets.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4 rounded-lg border border-dashed border-slate-700">
            {LL.presets.noPresets()}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {presets.map((preset) => (
              <div key={preset.id} className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-slate-100 truncate">{preset.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(preset.createdAt, LL.presets.dateLocale())}
                  </p>
                </div>

                <div className="flex gap-1.5">
                  {/* Load */}
                  <button
                    onClick={() => onLoad(preset.config)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded transition-colors font-semibold"
                  >
                    <Download size={12} />
                    {LL.presets.load()}
                  </button>

                  {/* Export JSON */}
                  <button
                    onClick={() => downloadPresetJson(preset.name, preset.createdAt, preset.config)}
                    title={LL.presets.exportJson()}
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded transition-colors font-semibold"
                  >
                    <FileDown size={12} />
                    {LL.presets.exportJson()}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded hover:bg-slate-700"
                    title={LL.presets.deletePreset()}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Import ── */}
      <div>
        <span className="section-title">{LL.presets.importTitle()}</span>

        {/* File upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileImport}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 rounded-lg transition-colors"
        >
          <Upload size={14} />
          {LL.presets.uploadJson()}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs text-slate-500">{LL.presets.orDivider()}</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Paste JSON */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <FileJson size={13} className="text-slate-400" />
          <span className="text-xs text-slate-400">{LL.presets.pasteLabel()}</span>
        </div>
        <textarea
          value={pasteJson}
          onChange={(e) => {
            setPasteJson(e.target.value);
            setImportError('');
          }}
          placeholder={'{\n  "bannerPreset": true,\n  ...\n}'}
          rows={4}
          className="control-input resize-none ltr text-xs font-mono"
        />

        {importError && <p className="text-xs text-red-400 mt-1.5">{importError}</p>}
        {importSuccess && <p className="text-xs text-green-400 mt-1.5">✓ {importSuccess}</p>}

        <button
          onClick={handlePasteImport}
          disabled={!pasteJson.trim()}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 font-semibold py-2 rounded-lg transition-colors"
        >
          {LL.presets.importFromText()}
        </button>
      </div>
    </div>
  );
}
