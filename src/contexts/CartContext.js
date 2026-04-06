// ============================================================
// CartContext.js - Context giỏ hàng (localStorage + Firestore orders)
// ============================================================

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createOrder } from '../backend/services/orderService';
import { getCouponByCode } from '../backend/services/couponService';
import { useState } from 'react';

import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_KEY = 'foodhub_cart'; // Key lưu vào localStorage

// ── Reducer xử lý các hành động giỏ hàng ────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.find((item) => item.id === action.payload.id);
      if (existing) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case 'REMOVE_FROM_CART':
      return state.filter((item) => item.id !== action.payload.id);

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return state.filter((item) => item.id !== action.payload.id);
      }
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
    case 'CLEAR_CART':
      return [];

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  // ── Apply coupon function ───────────────────────────────
  const applyCoupon = async (code) => {
    try {
      const coupon = await getCouponByCode(code);
      if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
        throw new Error(`Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này!`);
      }
      let discountAmount;
      if (coupon.discountType === 'percent') {
        discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
      } else {
        discountAmount = coupon.discountValue;
      }
      // Cap discount at subtotal
      discountAmount = Math.min(discountAmount, subtotal);
      coupon.discountAmount = discountAmount;
      setAppliedCoupon(coupon);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const clearCoupon = () => setAppliedCoupon(null);


  // Khởi tạo giỏ hàng từ localStorage (tránh mất khi reload)
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Đồng bộ giỏ hàng vào localStorage mỗi khi thay đổi ──
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // ── Tính tổng số món, subtotal và final total ──────────
  const cartCount   = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal    = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);


  // ── Đặt hàng với mã giảm giá ──────────────────────────
  const checkout = async ({ phone, address, paymentMethod = 'cash', note = '', coupon = null }) => {
    if (!user) throw new Error('Vui lòng đăng nhập trước khi đặt hàng!');
    if (cart.length === 0) throw new Error('Giỏ hàng đang trống!');

    const items = cart.map((item) => ({
      productId:   item.id,
      productName: item.name,
      imageUrl:    item.imageUrl || item.image || '',
      price:       item.price,
      quantity:    item.quantity,
    }));

    const orderData = {
      userId:        user.uid,
      userName:      userProfile?.displayName || user.displayName || 'Khách',
      phone,
      address,
      items,
      subtotal:      subtotal,
      paymentMethod,
      note,
    };

    // Apply coupon if provided
    if (coupon) {
      orderData.couponId = coupon.id;
      orderData.couponCode = coupon.code;
      orderData.discountAmount = coupon.discountAmount;
      orderData.totalAmount = subtotal - coupon.discountAmount;
    } else {
      orderData.totalAmount = subtotal;
    }

    const orderId = await createOrder(orderData);
    dispatch({ type: 'CLEAR_CART' });
    return orderId;
  };


  const value = {
    cart,
    dispatch,
    cartCount,
    subtotal,
    appliedCoupon,
    applyCoupon,
    clearCoupon,
    finalTotal: appliedCoupon ? (subtotal - appliedCoupon.discountAmount) : subtotal,
    checkout,
  };



  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
