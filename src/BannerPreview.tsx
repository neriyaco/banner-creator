import { useEffect, useRef, useState } from 'react';
import type { BannerConfig } from './types';
import { cssBackground } from './utils';

function IconEl({ value, size }: { value: string; size: number }) {
  if (value.startsWith('data:'))
    return (
      <img
        src={value}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      />
    );
  return <span style={{ fontSize: size, lineHeight: 1 }}>{value}</span>;
}

interface Props {
  config: BannerConfig;
}

export default function BannerPreview({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function recalc() {
      if (!containerRef.current) return;
      const pw = containerRef.current.clientWidth;
      const ph = containerRef.current.clientHeight;
      const sx = pw / config.width;
      const sy = ph / config.height;
      setScale(Math.min(sx, sy, 1));
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [config.width, config.height]);

  const lines = config.text.split('\n');
  const lh = config.fontSize * config.lineHeight;

  const textShadow = config.textShadow
    ? '2px 3px 10px rgba(0,0,0,0.45)'
    : undefined;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      {/* Scaled wrapper to reserve the right amount of space */}
      <div
        style={{
          width: config.width * scale,
          height: config.height * scale,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: config.width,
            height: config.height,
            borderRadius: config.borderRadius,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            direction: 'rtl',
            ...cssBackground(config),
          }}
        >
          {/* Left icon */}
          {config.leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: config.iconSize * 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
              }}
            >
              <IconEl value={config.leftIcon} size={config.iconSize} />
            </div>
          )}

          {/* Right icon */}
          {config.rightIcon && (
            <div
              style={{
                position: 'absolute',
                right: config.iconSize * 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
              }}
            >
              <IconEl value={config.rightIcon} size={config.iconSize} />
            </div>
          )}

          {/* Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            {lines.map((line, i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  fontFamily: `'${config.fontFamily}', sans-serif`,
                  fontSize: config.fontSize,
                  fontWeight: config.fontWeight,
                  color: config.textColor,
                  letterSpacing: config.letterSpacing,
                  lineHeight: config.lineHeight,
                  textShadow,
                  whiteSpace: 'pre',
                }}
              >
                {line || '\u00A0'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
