import type { BannerConfig, GradientConfig } from './types';
import type { CSSProperties } from 'react';

export function cssGradient(g: GradientConfig): string {
  const stops = [...g.stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');

  if (g.type === 'linear') return `linear-gradient(${g.angle}deg, ${stops})`;
  return `radial-gradient(${g.shape} at center, ${stops})`;
}

export function cssBackground(cfg: BannerConfig): CSSProperties {
  if (cfg.background.type === 'solid') return { backgroundColor: cfg.background.color };
  return { background: cssGradient(cfg.background.gradient) };
}

/** Draw the banner onto an existing canvas context. Used by preview and export. */
export async function drawBanner(ctx: CanvasRenderingContext2D, cfg: BannerConfig): Promise<void> {
  await document.fonts.ready;

  const { width, height } = cfg;

  ctx.clearRect(0, 0, width, height);
  ctx.save();

  // Rounded corners clip
  if (cfg.borderRadius > 0) {
    roundedRect(ctx, 0, 0, width, height, cfg.borderRadius);
    ctx.clip();
  }

  // Background
  if (cfg.background.type === 'solid') {
    ctx.fillStyle = cfg.background.color;
    ctx.fillRect(0, 0, width, height);
  } else {
    const g = cfg.background.gradient;
    const sorted = [...g.stops].sort((a, b) => a.position - b.position);

    let grad: CanvasGradient;
    if (g.type === 'linear') {
      const rad = (g.angle * Math.PI) / 180;
      const cx = width / 2,
        cy = height / 2;
      const len =
        Math.abs((width / 2) * Math.sin(rad)) + Math.abs((height / 2) * Math.cos(rad));
      grad = ctx.createLinearGradient(
        cx - Math.sin(rad) * len,
        cy + Math.cos(rad) * len,
        cx + Math.sin(rad) * len,
        cy - Math.cos(rad) * len
      );
    } else {
      grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
    }

    sorted.forEach((s) => grad.addColorStop(s.position / 100, s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Text
  ctx.font = `${cfg.fontWeight} ${cfg.fontSize}px "${cfg.fontFamily}", sans-serif`;
  ctx.direction = /[\u0590-\u05FF\u0600-\u06FF]/.test(cfg.text) ? 'rtl' : 'ltr';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = cfg.textColor;

  if (cfg.letterSpacing !== 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).letterSpacing = `${cfg.letterSpacing}px`;
  }

  if (cfg.textShadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
  }

  const lines = cfg.text.split('\n');
  const lh = cfg.fontSize * cfg.lineHeight;
  const totalH = lines.length * lh;
  const blockTop = height / 2 - totalH / 2;

  const ref = ctx.measureText('Agהנ');
  const baselineShift = (ref.actualBoundingBoxAscent - ref.actualBoundingBoxDescent) / 2;

  lines.forEach((line, i) => {
    const lineCenter = blockTop + i * lh + lh / 2;
    ctx.fillText(line, width / 2, lineCenter + baselineShift);
  });

  // Icons (reset shadow first)
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const offsetX = (cfg.iconOffset / 100) * width;
  const iconY = height / 2;

  await drawIcon(ctx, cfg.rightIcon, width - offsetX + cfg.iconSize / 2, iconY, cfg.iconSize, 'right');
  await drawIcon(ctx, cfg.leftIcon, offsetX - cfg.iconSize / 2, iconY, cfg.iconSize, 'left');

  ctx.restore();
}

/** Draw the banner onto a new canvas and trigger a PNG download. */
export async function exportToPng(cfg: BannerConfig): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = cfg.width;
  canvas.height = cfg.height;
  await drawBanner(canvas.getContext('2d')!, cfg);

  const link = document.createElement('a');
  link.download = 'banner.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** Draw a single icon — emoji text or an uploaded image (data: URL). */
async function drawIcon(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  align: 'left' | 'right'
): Promise<void> {
  if (!value) return;

  if (value.startsWith('data:')) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Maintain aspect ratio, fit within size × size
        const aspect = img.width / img.height;
        const w = aspect >= 1 ? size : size * aspect;
        const h = aspect >= 1 ? size / aspect : size;
        const drawX = align === 'right' ? x - w : x;
        const drawY = y - h / 2;
        ctx.drawImage(img, drawX, drawY, w, h);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = value;
    });
  } else {
    ctx.font = `${size}px serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
  }
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Preset JSON export ─────────────────────────────────────────────────────

export type PresetFile = {
  bannerPreset: true;
  name: string;
  createdAt: number;
  config: BannerConfig;
};

/** Download a preset as a .json file. */
export function downloadPresetJson(name: string, createdAt: number, config: BannerConfig): void {
  const data: PresetFile = { bannerPreset: true, name, createdAt, config };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^\w\u0590-\u05fe]/g, '_') || 'preset'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse an imported JSON string into a BannerConfig.
 * Accepts either a full PresetFile envelope or a raw BannerConfig object.
 * Returns { config, name } on success, or throws with a descriptive message.
 */
export function parsePresetJson(json: string): { config: BannerConfig; name: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('JSON לא תקין — ודא שהתוכן שלם ותקין');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('פורמט לא מזוהה');
  const obj = parsed as Record<string, unknown>;

  // Full preset envelope
  if (obj.bannerPreset === true && obj.config && typeof obj.config === 'object') {
    return {
      config: obj.config as BannerConfig,
      name: typeof obj.name === 'string' ? obj.name : 'פריסט מיובא',
    };
  }
  // Raw BannerConfig — must have at minimum width + height + text
  if (
    typeof obj.width === 'number' &&
    typeof obj.height === 'number' &&
    typeof obj.text === 'string'
  ) {
    return { config: obj as unknown as BannerConfig, name: 'פריסט מיובא' };
  }
  throw new Error('הקובץ אינו פריסט תקין של יוצר הבאנר');
}
