export interface DisasterTheme {
  tipo: string;
  label: string;
  color: string;
  fillColor: string;
  bgBadge: string;
  textBadge: string;
  icon: string;
}

export const DISASTER_THEMES: Record<string, DisasterTheme> = {
  TERREMOTO: {
    tipo: 'TERREMOTO',
    label: 'Terremoto / Sismo',
    color: '#7c3aed',
    fillColor: '#8b5cf6',
    bgBadge: '#f3e8ff',
    textBadge: '#6b21a8',
    icon: '🌋',
  },
  DESLAVE: {
    tipo: 'DESLAVE',
    label: 'Deslave / Alud de Tierra',
    color: '#dc2626',
    fillColor: '#ef4444',
    bgBadge: '#fee2e2',
    textBadge: '#b91c1c',
    icon: '🪨',
  },
  INUNDACION: {
    tipo: 'INUNDACION',
    label: 'Inundación / Desbordamiento',
    color: '#0284c7',
    fillColor: '#38bdf8',
    bgBadge: '#e0f2fe',
    textBadge: '#0369a1',
    icon: '🌧️',
  },
  HURACAN: {
    tipo: 'HURACAN',
    label: 'Huracán / Ciclón Tropical',
    color: '#0891b2',
    fillColor: '#22d3ee',
    bgBadge: '#cffafe',
    textBadge: '#155e75',
    icon: '🌀',
  },
  TORNADO: {
    tipo: 'TORNADO',
    label: 'Tornado / Vientos Fuertes',
    color: '#d97706',
    fillColor: '#fbbf24',
    bgBadge: '#fef3c7',
    textBadge: '#b45309',
    icon: '🌪️',
  },
  INCENDIO: {
    tipo: 'INCENDIO',
    label: 'Incendio Forestal / Urbano',
    color: '#ea580c',
    fillColor: '#f97316',
    bgBadge: '#ffedd5',
    textBadge: '#c2410c',
    icon: '🔥',
  },
  VOLCAN: {
    tipo: 'VOLCAN',
    label: 'Erupción Volcánica',
    color: '#b91c1c',
    fillColor: '#dc2626',
    bgBadge: '#fef2f2',
    textBadge: '#991b1b',
    icon: '🌋',
  },
  TSUNAMI: {
    tipo: 'TSUNAMI',
    label: 'Tsunami / Marejada',
    color: '#0f766e',
    fillColor: '#14b8a6',
    bgBadge: '#ccfbf1',
    textBadge: '#0f766e',
    icon: '🌊',
  },
  SEQUIA: {
    tipo: 'SEQUIA',
    label: 'Sequía / Onda de Calor',
    color: '#ca8a04',
    fillColor: '#facc15',
    bgBadge: '#fef9c3',
    textBadge: '#a16207',
    icon: '☀️',
  },
  HELADA: {
    tipo: 'HELADA',
    label: 'Ola de Frío / Helada',
    color: '#0284c7',
    fillColor: '#7dd3fc',
    bgBadge: '#e0f2fe',
    textBadge: '#0369a1',
    icon: '❄️',
  },
  EPIDEMIA: {
    tipo: 'EPIDEMIA',
    label: 'Emergencia Sanitaria',
    color: '#059669',
    fillColor: '#10b981',
    bgBadge: '#d1fae5',
    textBadge: '#047857',
    icon: '☣️',
  },
  COLAPSO: {
    tipo: 'COLAPSO',
    label: 'Colapso Estructural',
    color: '#475569',
    fillColor: '#64748b',
    bgBadge: '#f1f5f9',
    textBadge: '#334155',
    icon: '💥',
  },
};

export function getDisasterTheme(tipo: string): DisasterTheme {
  return (
    DISASTER_THEMES[tipo] || {
      tipo,
      label: tipo,
      color: '#dc2626',
      fillColor: '#ef4444',
      bgBadge: '#fee2e2',
      textBadge: '#b91c1c',
      icon: '⚠️',
    }
  );
}
