// Сопоставление выбранного в CMS акцентного цвета с настоящими
// CSS-переменными шаблона (градиенты карточек + цвет "стад"-полоски).
export const accentPalette = {
  brick: { c1: '#FFD27A', c2: '#E13438', tab: 'var(--brick)' },
  sky: { c1: '#9FD6FF', c2: '#3F9DE0', tab: 'var(--sky)' },
  grass: { c1: '#B7F0C7', c2: '#4FB477', tab: 'var(--grass)' },
  sun: { c1: '#FFE38F', c2: '#FFC93C', tab: 'var(--sun)' },
  grape: { c1: '#E6D6FF', c2: '#8B5FBF', tab: 'var(--grape)' },
} as const;

export type AccentColor = keyof typeof accentPalette;
