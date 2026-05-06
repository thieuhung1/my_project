// ============================================================
// CartContext.js - Context giỏ hàng (localStorage + Firestore orders)
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import { createOrder } from '../features/controllers/orderService';
import { PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_PROVIDER } from '../features/models/Order.model';
import { getCouponByCode } from '../features/controllers/couponService';
import { useAuth } from './AuthContext';
//----------------------------------------------------------
// Tạo context giỏ hàng.
const CartContext = createContext();//-- dùng để chia sẻ dữ liệu giỏ hàng giữa các component.

const CART_KEY_PREFIX = 'foodhub_cart'; //-- dùng để lưu dữ liệu giỏ hàng vào localStorage.
//----------------------------------------------------------
// Hàm reducer để xử lý các hành động trên giỏ hàng.
const cartReducer = (state, action) => {
  //-- kiểm tra loại hành động trên giỏ hàng.
  switch (action.type) {
    //-- thêm sản phẩm vào giỏ hàng.
    case 'ADD_TO_CART': {
      //-- xử lý thêm sản phẩm vào giỏ hàng.
      const product = action.payload.product || action.payload;
      //-- lấy số lượng sản phẩm từ payload.
      const quantity = action.payload.quantity ?? 1;
      //-- kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa.
      const existing = state.find((item) => item.id === product.id);
      //-- lấy số lượng tồn kho sản phẩm từ payload.
      const stock = product.stock ?? 999;
      //-- kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa.
      
      if (existing) {
        //-- tính tổng số lượng sản phẩm trong giỏ hàng.
        const newQuantity = existing.quantity + quantity;
        // nếu số lượng sản phẩm lớn hơn số lượng tồn kho thì hiển thị thông báo lỗi.
        if (newQuantity > stock) {
          alert('Rất tiếc, sản phẩm này đã hết hàng hoặc đạt giới hạn kho!');
          return state;
        }//-- cập nhật số lượng sản phẩm trong giỏ hàng.
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