export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'Tutti',
    emoji: '🎉',
    color: '#9C27B0',
  },
  {
    id: 'food',
    name: 'Cibo',
    emoji: '🍕',
    color: '#FF5722',
  },
  {
    id: 'drinks',
    name: 'Bevande',
    emoji: '🥤',
    color: '#2196F3',
  },
  {
    id: 'desserts',
    name: 'Dolci',
    emoji: '🍰',
    color: '#E91E63',
  },
  {
    id: 'snacks',
    name: 'Snack',
    emoji: '🍿',
    color: '#FF9800',
  },
  {
    id: 'other',
    name: 'Altro',
    emoji: '⭐',
    color: '#607D8B',
  },
];

export const getCategoryById = (id?: string): Category => {
  return DEFAULT_CATEGORIES.find(cat => cat.id === id) || DEFAULT_CATEGORIES[0];
};
