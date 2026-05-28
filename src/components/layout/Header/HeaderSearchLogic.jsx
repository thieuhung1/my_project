
import { useMemo } from 'react';

const normalizeText = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const useHeaderSearchResults = (products, searchQuery) => {
  return useMemo(() => {
    const keyword = normalizeText(searchQuery);
    if (!keyword) return [];

    return products
      .map((product) => {
        const name = normalizeText(product.name);
        const description = normalizeText(product.description || '');
        const category = normalizeText(product.category || '');
        const haystack = `${name} ${description} ${category}`;
        let score = 0;

        if (name === keyword) score += 120;
        if (name.startsWith(keyword)) score += 80;
        if (haystack.includes(keyword)) score += 50;

        keyword.split(/\s+/).filter(Boolean).forEach((token) => {
          if (name.includes(token)) score += 18;
          if (description.includes(token)) score += 10;
          if (category.includes(token)) score += 8;
        });

        if (!score) return null;
        return { ...product, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [products, searchQuery]);
};
