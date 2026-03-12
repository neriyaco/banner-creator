# Banner Creator

A web-based banner designer built for Hebrew-speaking teams. Design, customize, and export banners as PNG — no server required.

**Live demo:** https://neriyaco.github.io/banner-creator/

---

## Features

- **Rich text** — font family (10 Hebrew-optimized Google Fonts), weight, size, color, letter-spacing, line-height, drop shadow
- **Flexible backgrounds** — solid color or fully customizable linear/radial gradients with unlimited color stops
- **Icons** — emoji picker (7 categories) + custom image upload (stored in IndexedDB, never leaves the browser)
- **Icon placement** — per-side emoji/image selection with a mirrored offset slider (edge ↔ center)
- **Size presets** — predefined sizes plus free-form width/height and border-radius controls
- **Presets system** — save, load, export to JSON, and import from JSON or paste — shareable across the team without a server
- **PNG export** — canvas-based, pixel-perfect rendering (no html2canvas)
- **Multilingual UI** — Hebrew (RTL) and English (LTR), detected from browser, persisted in localStorage
- **GitHub Pages deployment** — CI/CD via GitHub Actions on push to `main`

---

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 19 + Vite 6 + TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| i18n | typesafe-i18n v5 |
| Persistence | IndexedDB (custom icons + presets) |
| Export | Canvas API |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/neriyaco/banner-creator.git
cd banner-creator
npm install
npm run dev
```

Open http://localhost:5173/banner-creator/

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run format` | Format all source files with Prettier |
| `npm run lint` | Lint TypeScript/TSX files with ESLint |
| `npm run i18n` | Regenerate i18n type files after editing locales |

---

## Project Structure

```
src/
├── App.tsx                  # Root layout, tab switcher, locale provider
├── BannerPreview.tsx         # Scaled live preview (ResizeObserver)
├── main.tsx                 # Entry point — loads all i18n locales
├── types.ts                 # BannerConfig and all related types
├── utils.ts                 # Canvas export, CSS gradient helpers
├── index.css                # Tailwind + component layer (@apply)
│
├── panels/
│   ├── TextPanel.tsx         # Font, size, color, shadow
│   ├── SizePanel.tsx         # Dimensions, presets, border radius
│   ├── BackgroundPanel.tsx   # Solid / gradient editor
│   ├── IconPanel.tsx         # Emoji picker + custom image upload
│   └── PresetsPanel.tsx      # Save / load / import / export presets
│
├── hooks/
│   ├── useCustomIcons.ts     # IndexedDB: banner-creator-db
│   └── usePresets.ts         # IndexedDB: banner-presets-db
│
└── i18n/
    ├── he/index.ts           # Base Hebrew locale (source of truth for keys)
    ├── en/index.ts           # English translations
    ├── i18n-types.ts         # ⚙ Auto-generated — do not edit
    ├── i18n-util*.ts         # ⚙ Auto-generated — do not edit
    └── i18n-react.tsx        # ⚙ Auto-generated — do not edit
```

---

## Adding a New Language

1. Create `src/i18n/<locale>/index.ts` matching the shape of `src/i18n/he/index.ts`
2. Run `npm run i18n` — this regenerates `i18n-types.ts` and adds the new locale to the `Locales` union
3. Add the locale label to `LOCALE_LABELS` in `src/App.tsx`:
   ```ts
   const LOCALE_LABELS: Record<Locales, string> = {
     he: 'עברית',
     en: 'English',
     fr: 'Français', // new
   };
   ```

RTL/LTR direction is derived automatically from the locale key — add your locale to the direction map in `App.tsx` if it differs from LTR:
```ts
const dir = locale === 'he' ? 'rtl' : 'ltr';
// extend as needed: locale === 'he' || locale === 'ar'
```

---

## Deployment

The site deploys automatically to GitHub Pages on every push to `main`.

**Initial setup (once):**
1. Push the repo to `github.com/neriyaco/banner-creator`
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. The next push to `main` will trigger the workflow and publish the site

The Vite `base` is set to `/banner-creator/` in `vite.config.ts` — update this if the repository name changes.

---

## Preset File Format

Presets can be exported as JSON and shared with teammates. Both file upload and paste-in-textarea import are supported.

```jsonc
{
  "bannerPreset": true,
  "name": "My preset",
  "createdAt": 1700000000000,
  "config": {
    // full BannerConfig object
  }
}
```

`parsePresetJson` in `utils.ts` also accepts a raw `BannerConfig` object (without the envelope) for quick imports.
