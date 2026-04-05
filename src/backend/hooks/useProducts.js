// ============================================================
// useProducts.js - Custom Hook lấy danh sách sản phẩm
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  getAllProducts,
  getProductsByCategory,
  getFeaturedProducts,
} from "../services/productService";

/**
 * Hook lấy và lọc sản phẩm từ Firestore
 * @param {string} [category] - Lọc theo danh mục (nếu có)
 * @returns {{ products, loading, error, refetch }}
 */
const useProducts = (category = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (category === "featured") {
        data = await getFeaturedProducts();
      } else if (category) {
        data = await getProductsByCategory(category);
      } else {
        data = await getAllProducts();
      }
      setProducts(data);
    } catch (err) {
      setError(err.message || "Không thể tải sản phẩm!");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

export default useProducts;
