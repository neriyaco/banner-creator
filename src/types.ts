export type GradientStop = {
  id: string;
  color: string;
  position: number; // 0–100
};

export type LinearGradient = {
  type: 'linear';
  angle: number; // CSS degrees: 0 = top, 90 = right
  stops: GradientStop[];
};

export type RadialGradient = {
  type: 'radial';
  shape: 'circle' | 'ellipse';
  stops: GradientStop[];
};

export type GradientConfig = LinearGradient | RadialGradient;

export type Background =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; gradient: GradientConfig };

export type BannerConfig = {
  width: number;
  height: number;
  text: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  letterSpacing: number;
  lineHeight: number;
  textShadow: boolean;
  background: Background;
  leftIcon: string;
  rightIcon: string;
  iconSize: number;
  iconOffset: number; // 0–50: % of banner width from each edge to icon center
  borderRadius: number;
};
