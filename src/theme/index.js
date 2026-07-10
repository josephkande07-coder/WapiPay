// src/theme/index.js
// 🎨 Thème global WapiPay — Bleu de nuit

export const colors = {
  // Fonds
  navy:        '#0A0F2C',
  deep:        '#0D1440',
  mid:         '#112066',

  // Bleus accent
  accent:      '#1A3AFF',
  bright:      '#4D6EFF',
  glow:        '#6B8FFF',

  // Couleurs fonctionnelles
  gold:        '#FFB830',
  goldSoft:    '#FFD580',
  success:     '#00E5A0',
  danger:      '#FF4D6D',
  warning:     '#FFB830',

  // Textes
  text:        '#E8EEFF',
  muted:       '#7A88CC',
  white:       '#FFFFFF',

  // Cartes & bordures
  card:        'rgba(17, 32, 102, 0.55)',
  border:      'rgba(77, 110, 255, 0.18)',
  overlay:     'rgba(10, 15, 44, 0.9)',
};

export const fonts = {
  regular:   'System',
  medium:    'System',
  bold:      'System',
  sizes: {
    xs:  10,
    sm:  12,
    md:  14,
    lg:  16,
    xl:  20,
    xxl: 28,
    xxxl:36,
  },
};

export const radius = {
  sm:   8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
  full:999,
};

export const spacing = {
  xs:  4,
  sm:  8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl:32,
};

export const shadows = {
  card: {
    shadowColor: '#1A3AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    shadowColor: '#1A3AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};
