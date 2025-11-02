import type { ContentAsset } from './types';

const STORAGE_KEY = 'content_assets';

export const storageService = {
  // 取得所有資產
  getAll(): ContentAsset[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // 取得單一資產
  getById(id: string): ContentAsset | null {
    const assets = this.getAll();
    return assets.find(asset => asset.id === id) || null;
  },

  // 新增資產
  create(asset: Omit<ContentAsset, 'id' | 'createdAt'>): ContentAsset {
    const newAsset: ContentAsset = {
      ...asset,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const assets = this.getAll();
    assets.unshift(newAsset); // 新的放最前面

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
      return newAsset;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  },

  // 刪除資產
  delete(id: string): boolean {
    try {
      const assets = this.getAll();
      const filteredAssets = assets.filter(asset => asset.id !== id);

      if (assets.length === filteredAssets.length) {
        return false; // 沒有找到要刪除的項目
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAssets));
      return true;
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      return false;
    }
  },

  // 清空所有資產
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
