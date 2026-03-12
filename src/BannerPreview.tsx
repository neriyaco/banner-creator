import { useEffect, useRef } from 'react';
import type { BannerConfig } from './types';
import { drawBanner } from './utils';

interface Props {
  config: BannerConfig;
}

export default function BannerPreview({ config }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Re-draw whenever any part of config changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set buffer size (also clears the canvas)
    canvas.width = config.width;
    canvas.height = config.height;

    // Fit CSS size to container
    const scale = Math.min(wrap.clientWidth / config.width, wrap.clientHeight / config.height, 1);
    canvas.style.width = `${config.width * scale}px`;
    canvas.style.height = `${config.height * scale}px`;

    void drawBanner(ctx, config);
  }, [config]);

  // Recalculate CSS size when the container is resized (no redraw needed)
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ro = new ResizeObserver(() => {
      const scale = Math.min(
        wrap.clientWidth / config.width,
        wrap.clientHeight / config.height,
        1
      );
      canvas.style.width = `${config.width * scale}px`;
      canvas.style.height = `${config.height * scale}px`;
    });

    ro.observe(wrap);
    return () => ro.disconnect();
  }, [config.width, config.height]);

  return (
    <div ref={wrapRef} className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
