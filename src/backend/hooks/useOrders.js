// ============================================================
// useOrders.js - Custom Hook quản lý đơn hàng người dùng
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  getOrdersByUser,
  getAllOrders,
  createOrder,
  updateOrderStatus,
} from "../services/orderService";

/**
 * Hook lấy đơn hàng theo người dùng hoặc tất cả (admin)
 * @param {string|null} userId - ID người dùng (null = lấy tất cả cho admin)
 * @returns {{ orders, loading, error, placeOrder, changeStatus, refetch }}
 */
const useOrders = (userId = null) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- Lấy đơn hàng ----
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = userId ? await getOrdersByUser(userId) : await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Không thể tải đơn hàng!");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ---- Đặt đơn hàng mới ----
  const placeOrder = async (orderData) => {
    const orderId = await createOrder(orderData);
    await fetchOrders(); // Làm mới danh sách
    return orderId;
  };

  // ---- Cập nhật trạng thái đơn hàng ----
  const changeStatus = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
    await fetchOrders();
  };

  return { orders, loading, error, placeOrder, changeStatus, refetch: fetchOrders };
};

export default useOrders;
