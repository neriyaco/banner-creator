import { useState } from 'react';
import type { BannerConfig } from './types';
import BannerPreview from './BannerPreview';
import TextPanel from './panels/TextPanel';
import SizePanel from './panels/SizePanel';
import BackgroundPanel from './panels/BackgroundPanel';
import IconPanel from './panels/IconPanel';
import PresetsPanel from './panels/PresetsPanel';
import { exportToPng } from './utils';
import { Download, Type, Maximize2, Palette, Smile, Bookmark } from 'lucide-react';
import TypesafeI18n, { useI18nContext } from './i18n/i18n-react';
import { detectLocale, isLocale } from './i18n/i18n-util';
import type { Locales } from './i18n/i18n-types';
import { navigatorDetector } from 'typesafe-i18n/detectors';

const LOCALE_STORAGE_KEY = 'banner-creator-locale';

const LOCALE_LABELS: Record<Locales, string> = {
  he: 'עברית',
  en: 'English',
};

function getInitialLocale(): Locales {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && isLocale(saved)) return saved;
  return detectLocale(navigatorDetector);
}

const DEFAULT_CONFIG: BannerConfig = {
  width: 1200,
  height: 400,
  text: 'כותרת הבאנר שלך',
  textColor: '#ffffff',
  fontSize: 80,
  fontFamily: 'Heebo',
  fontWeight: '700',
  letterSpacing: 2,
  lineHeight: 1.2,
  textShadow: false,
  background: {
    type: 'gradient',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { id: 'a', color: '#667eea', position: 0 },
        { id: 'b', color: '#764ba2', position: 100 },
      ],
    },
  },
  leftIcon: '✨',
  rightIcon: '✨',
  iconSize: 72,
  borderRadius: 0,
};

type TabId = 'text' | 'size' | 'background' | 'icons' | 'presets';

const initialLocale = getInitialLocale();

function AppContent() {
  const { LL, locale, setLocale } = useI18nContext();
  const [config, setConfig] = useState<BannerConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabId>('text');
  const [exporting, setExporting] = useState(false);

  const dir = locale === 'he' ? 'rtl' : 'ltr';

  function handleLocaleChange(newLocale: Locales) {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setLocale(newLocale);
  }

  const TABS = [
    { id: 'text' as TabId,       label: LL.tabs.text(),       Icon: Type },
    { id: 'size' as TabId,       label: LL.tabs.size(),       Icon: Maximize2 },
    { id: 'background' as TabId, label: LL.tabs.background(), Icon: Palette },
    { id: 'icons' as TabId,      label: LL.tabs.icons(),      Icon: Smile },
    { id: 'presets' as TabId,    label: LL.tabs.presets(),    Icon: Bookmark },
  ];

  function update(partial: Partial<BannerConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }));
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportToPng(config);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ direction: dir }}>
      {/* ── Controls sidebar ── */}
      <aside className="flex flex-col w-80 shrink-0 bg-slate-900 border-l border-slate-700/60 overflow-hidden">
        {/* App header */}
        <div className="px-5 py-4 border-b border-slate-700/60 shrink-0 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">{LL.app.title()}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{LL.app.subtitle()}</p>
          </div>
          <select
            value={locale}
            onChange={(e) => handleLocaleChange(e.target.value as Locales)}
            className="mt-0.5 text-xs font-semibold rounded bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 px-2 py-1 cursor-pointer transition-colors shrink-0"
            style={{ direction: 'ltr' }}
          >
            {(Object.keys(LOCALE_LABELS) as Locales[]).map((l) => (
              <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-slate-700/60 shrink-0">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-btn flex flex-col items-center gap-0.5 ${activeTab === id ? 'tab-btn-active' : ''}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'text'       && <TextPanel config={config} onChange={update} />}
          {activeTab === 'size'       && <SizePanel config={config} onChange={update} />}
          {activeTab === 'background' && <BackgroundPanel config={config} onChange={update} />}
          {activeTab === 'icons'      && <IconPanel config={config} onChange={update} />}
          {activeTab === 'presets'    && <PresetsPanel config={config} onLoad={setConfig} />}
        </div>

        {/* Export button */}
        <div className="p-4 border-t border-slate-700/60 shrink-0">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-wait text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
          >
            <Download size={16} />
            {exporting ? LL.app.exporting() : LL.app.exportPng()}
          </button>
        </div>
      </aside>

      {/* ── Preview area ── */}
      <main
        className="flex-1 flex flex-col items-center justify-center bg-slate-800 overflow-hidden p-6"
        style={{ direction: 'ltr' }}
      >
        <BannerPreview config={config} />
        <p className="mt-4 text-xs text-slate-500 select-none">
          {config.width} × {config.height} px
        </p>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TypesafeI18n locale={initialLocale}>
      <AppContent />
    </TypesafeI18n>
  );
}
