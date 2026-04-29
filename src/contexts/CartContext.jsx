// ============================================================
// CartContext.js - Context giỏ hàng (localStorage + Firestore orders)
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import { createOrder } from '../backend/services/orderService';
import { PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_PROVIDER } from '../backend/models/Order.model';
import { getCouponByCode } from '../backend/services/couponService';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_KEY_PREFIX = 'foodhub_cart'; 

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Handle both { product, quantity } and legacy product-only payloads
      const product = action.payload.product || action.payload;
      const quantity = action.payload.quantity ?? 1;
      
      const existing = state.find((item) => item.id === product.id);
      const stock = product.stock ?? 999;
      
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > stock) {
          alert('Rất tiếc, sản phẩm này đã hết hàng hoặc đạt giới hạn kho!');
          return state;
        }
        return state.map((item) => item.id === product.id ? { ...item, quantity: newQuantity } : item);
      }
      return [...state, { ...product, quantity }];
    }
    case 'REMOVE_FROM_CART': return state.filter((item) => item.id !== action.payload.id);
    case 'UPDATE_QUANTITY': return state.map(i => i.id === action.payload.id ? {...i, quantity: action.payload.quantity} : i);
    case 'CLEAR_CART': return [];
    case 'LOAD_CART': return action.payload;
    default: return state;
  }
};

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const [cart, baseDispatch] = useReducer(cartReducer, []);
  
  const cartStorageKey = useMemo(() => (user?.uid ? `${CART_KEY_PREFIX}_${user.uid}` : null), [user?.uid]);

  useEffect(() => {
    setIsCartHydrated(false);
    if (!cartStorageKey) { 
        baseDispatch({ type: 'LOAD_CART', payload: [] }); 
        setIsCartHydrated(true); 
        return; 
    }
    try {
      const saved = localStorage.getItem(cartStorageKey);
      baseDispatch({ type: 'LOAD_CART', payload: saved ? JSON.parse(saved) : [] });
    } catch (e) { 
        baseDispatch({ type: 'LOAD_CART', payload: [] }); 
    } finally { 
        setIsCartHydrated(true); 
    }
  }, [cartStorageKey]);

  useEffect(() => {
    if (!cartStorageKey || !isCartHydrated) return;
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, cartStorageKey, isCartHydrated]);

  const dispatch = useCallback((action) => {
    if (action?.type === 'ADD_TO_CART' && !user) { alert('Vui lòng đăng nhập để tiếp tục!'); return false; }
    baseDispatch(action); return true;
  }, [user]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!user) { alert('Vui lòng đăng nhập để thêm vào giỏ hàng!'); return false; }
    baseDispatch({ type: 'ADD_TO_CART', payload: { product, quantity } }); return true;
  }, [user]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async (code) => {
    try {
      const coupon = await getCouponByCode(code);
      if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) throw new Error('Đơn hàng tối thiểu không đủ để áp dụng mã này!');
      let disc = coupon.discountType === 'percent' ? Math.round(subtotal * (coupon.discountValue / 100)) : coupon.discountValue;
      coupon.discountAmount = Math.min(disc, subtotal);
      setAppliedCoupon(coupon);
    } catch (e) { throw new Error(e.message); }
  };

  const clearCoupon = () => setAppliedCoupon(null);

  const checkout = async ({ type = 'DELIVERY', tableId = null, phone, address, paymentMethod = PAYMENT_METHOD.COD, note = '', coupon = null }) => {
    if (!user) throw new Error('Vui lòng đăng nhập trước khi thanh toán!');
    if (cart.length === 0) throw new Error('Giỏ hàng trống!');
    const items = cart.map((item) => ({ 
        productId: item.id, 
        productName: item.name, 
        price: item.price, 
        quantity: item.quantity,
        imageUrl: item.imageUrl || item.image || ''
    }));
    const orderData = {
      userId: user.uid,
      userName: userProfile?.displayName || user.displayName || 'Khách hàng',
      phone,
      address: type === 'DINE_IN' ? 'Ăn tại quán' : address,
      items,
      subtotal,
      paymentMethod: type === 'DINE_IN' ? PAYMENT_METHOD.COD : paymentMethod,
      paymentStatus: PAYMENT_STATUS.UNPAID,
      paymentProvider: paymentMethod === PAYMENT_METHOD.VNPAY ? PAYMENT_PROVIDER.VNPAY : paymentMethod === PAYMENT_METHOD.MOMO ? PAYMENT_PROVIDER.LOCAL : PAYMENT_PROVIDER.LOCAL,
      type,
      table_id: tableId,
      note,
    };
    if (coupon) {
      orderData.couponId = coupon.id; orderData.couponCode = coupon.code;
      orderData.discountAmount = coupon.discountAmount; orderData.totalAmount = subtotal - coupon.discountAmount;
    } else { orderData.totalAmount = subtotal; }
    const orderId = await createOrder(orderData);
    baseDispatch({ type: 'CLEAR_CART' }); return orderId;
  };

  const finalTotal = appliedCoupon ? (subtotal - appliedCoupon.discountAmount) : subtotal;

  const value = { 
      cart, 
      dispatch, 
      addToCart, 
      cartCount, 
      subtotal, 
      appliedCoupon, 
      applyCoupon, 
      clearCoupon, 
      finalTotal, 
      checkout 
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};