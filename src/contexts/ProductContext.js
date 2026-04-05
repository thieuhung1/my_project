// ============================================================
// ProductContext.js - Context quản lý sản phẩm (Firebase Firestore)
// Thay thế dữ liệu tĩnh bằng dữ liệu thật từ Firestore
// ============================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getAllProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getProductById,
  getAllCategories,
} from '../backend';

const ProductContext = createContext();

// Hook để dùng trong các component
export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts]           = useState([]);    // Tất cả sản phẩm
  const [featured, setFeatured]           = useState([]);    // Sản phẩm nổi bật
  const [categories, setCategories]       = useState([]);    // Danh mục
  const [activeCategory, setActiveCategory] = useState(null); // Danh mục đang lọc
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  // ── Lấy toàn bộ sản phẩm & danh mục khi khởi động ──────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const [allProducts, allCategories, featuredProducts] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
          getFeaturedProducts(8),
        ]);
        setProducts(allProducts);
        setCategories(allCategories);
        setFeatured(featuredProducts);
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại!');
        console.error('[ProductContext]', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Lọc sản phẩm theo danh mục ──────────────────────────
  const filterByCategory = useCallback(async (category) => {
    setLoading(true);
    setActiveCategory(category);
    try {
      const data = category
        ? await getProductsByCategory(category)
        : await getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Lọc danh mục thất bại!');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Lấy sản phẩm theo ID ────────────────────────────────
  const fetchProductById = useCallback(async (id) => {
    try {
      return await getProductById(id);
    } catch {
      return null;
    }
  }, []);

  // ── Tìm kiếm sản phẩm (client-side) ─────────────────────
  const searchProducts = useCallback((keyword) => {
    if (!keyword.trim()) return products;
    const lower = keyword.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower)
    );
  }, [products]);

  // ── Làm mới toàn bộ ─────────────────────────────────────
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeCategory
        ? await getProductsByCategory(activeCategory)
        : await getAllProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  const value = {
    products,
    featured,
    categories,
    activeCategory,
    loading,
    error,
    filterByCategory,
    fetchProductById,
    searchProducts,
    refetch,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
