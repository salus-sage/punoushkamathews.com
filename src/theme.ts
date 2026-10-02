export interface Theme {
  id: 'light' | 'dark' | 'funk'
  label: string
  swatch: string
  bg: string
  surface: string
  muted: string
  text: string
  textMuted: string
  textFaint: string
  border: string
  divider: string
  accent: string
  accentFg: string
  navBg: string
  tagBg: string
  tagText: string
}

export const THEMES: Theme[] = [
  {
    id: 'light',
    label: 'Light',
    swatch: '#F8F6F2',
    bg: '#F8F6F2',
    surface: '#FFFFFF',
    muted: '#EDE9E3',
    text: '#1A1714',
    textMuted: '#5C5751',
    textFaint: '#9A948E',
    border: '#E5E0D8',
    divider: '#EDE9E3',
    accent: '#1A1714',
    accentFg: '#F8F6F2',
    navBg: 'rgba(248,246,242,0.92)',
    tagBg: '#E8E3DC',
    tagText: '#6B6560',
  },
  {
    id: 'dark',
    label: 'Dark',
    swatch: '#141210',
    bg: '#141210',
    surface: '#1F1C19',
    muted: '#272420',
    text: '#EDE8E1',
    textMuted: '#8A8078',
    textFaint: '#564E48',
    border: '#2E2A26',
    divider: '#272420',
    accent: '#C9A96E',
    accentFg: '#141210',
    navBg: 'rgba(20,18,16,0.92)',
    tagBg: '#2E2A26',
    tagText: '#8A8078',
  },
]
