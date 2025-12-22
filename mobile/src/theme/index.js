// Theme configuration for Echo app
export const colors = {
  // Primary Colors
  primary: '#007AFF',
  primaryPurple: '#5856D6',
  softBlue: '#A8C5DD',
  lavender: '#C5B3D9',
  
  // Semantic Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  insight: '#FFCC00',
  
  // Neutral Colors
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  border: '#E5E5EA',
  
  // Gradient Presets for Soundscapes
  gradients: {
    default: ['#A8C5DD', '#C5B3D9'],
    sunset: ['#FF6B6B', '#FFE66D'],
    ocean: ['#4ECDC4', '#556270'],
    forest: ['#96CEB4', '#FFEAA7'],
    twilight: ['#667EEA', '#764BA2'],
    peach: ['#FFECD2', '#FCB69F'],
    mint: ['#A8E6CF', '#DCEDC1'],
    lavenderDream: ['#E0C3FC', '#8EC5FC'],
  },
};

export const typography = {
  fontFamily: {
    primary: 'System', // SF Pro on iOS, Roboto on Android
    serif: 'Georgia', // For accent text
  },
  sizes: {
    h1: 28,
    h2: 22,
    h3: 18,
    body: 16,
    caption: 14,
    label: 12,
  },
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  containerMargin: 20,
};

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  circle: 9999,
};

export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 400,
    verySlow: 600,
  },
  easing: {
    default: 'ease-in-out',
    spring: 'spring',
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
};
