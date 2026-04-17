import { useState, useEffect, useCallback } from "react";
import {
  getAllProducts,
  getProductsByCategory,
  getFeaturedProducts,
} from "../services/productService";

// Chọn đúng nguồn dữ liệu theo category để tránh lặp if/else ở nhiều nơi.
const loadProductsByCategory = (category) => {
  switch (category) {
    case "featured":
      return getFeaturedProducts();
    case null:
    case undefined:
    case "":
      return getAllProducts();
    default:
      return getProductsByCategory(category);
  }
};

const useProducts = (category = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await loadProductsByCategory(category);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải sản phẩm!");
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
