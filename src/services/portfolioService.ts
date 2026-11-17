import { PortfolioItem } from '../types';
import { generateId, getItem, setItem, STORAGE_KEYS } from './storageService';

export const portfolioService = {
  getAll(): PortfolioItem[] {
    return getItem<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIOS, []);
  },

  saveAll(items: PortfolioItem[]): void {
    setItem(STORAGE_KEYS.PORTFOLIOS, items);
  },

  create(
    items: PortfolioItem[],
    data: Omit<PortfolioItem, 'id' | 'createdAt'>
  ): { item: PortfolioItem; updatedItems: PortfolioItem[] } {
    const item: PortfolioItem = {
      ...data,
      id: generateId('port'),
      createdAt: new Date().toISOString(),
    };
    const updatedItems = [item, ...items];
    this.saveAll(updatedItems);
    return { item, updatedItems };
  },

  update(
    items: PortfolioItem[],
    id: string,
    updates: Partial<PortfolioItem>
  ): PortfolioItem[] {
    const updatedItems = items.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.saveAll(updatedItems);
    return updatedItems;
  },

  remove(items: PortfolioItem[], id: string): PortfolioItem[] {
    const updatedItems = items.filter((p) => p.id !== id);
    this.saveAll(updatedItems);
    return updatedItems;
  },
};
