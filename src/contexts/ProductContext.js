import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
const sampleProducts = [
  { id: 1, name: 'Phở Bò', price: 50000, image: '/ASSETS/Images/phở bò.jpeg', description: 'Phở bò truyền thống nóng hổi', category: 'pho' },
  { id: 2, name: 'Bánh Mì', price: 25000, image: '/ASSETS/Images/bánh mì.jpg', description: 'Bánh mì pate thịt nguội', category: 'banhmi' },
  { id: 3, name: 'Bánh Xèo', price: 60000, image: '/ASSETS/Images/bánh xèo.jpg', description: 'Bánh xèo giòn tan tôm thịt', category: 'banhxeo' },
  { id: 4, name: 'Gỏi Cuốn', price: 30000, image: '/ASSETS/Images/Gỏi cuốn.webp', description: 'Gỏi cuốn tôm thịt tươi', category: 'goi' },
  { id: 5, name: 'Chả Cuốn', price: 40000, image: '/ASSETS/Images/chả cuốn.jpg', description: 'Chả cuốn nem nướng', category: 'cha' },
  { id: 6, name: 'Mì Quảng', price: 55000, image: '/ASSETS/Images/mì quảng.jpg', description: 'Mì quảng tôm thịt đặc sản', category: 'mi' },
];

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock API call
    const fetchProducts = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(sampleProducts);
      } catch (err) {
        setError('Không tải được sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, refetch: () => setLoading(true) }}>
      {children}
    </ProductContext.Provider>
  );
};

