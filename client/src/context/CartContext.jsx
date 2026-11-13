import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { productsAPI } from '../utils/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const MAX_LINE_QUANTITY = 20;

export const cartKey = (id, size = '') => `${id}|${size}`;

export const getVariantStock = (product, size = '') => {
  if (product.category === 'clothing') {
    const match = (product.sizes || []).find((s) => s.size === size);
    return match ? match.stock : 0;
  }
  return product.stock ?? 0;
};

const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((item) => item && item.id)
      .map((item) => ({ ...item, size: item.size || '', key: cartKey(item.id, item.size || '') }));
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch {
      // storage unavailable: cart stays in memory only
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, size = '') => {
    const available = Math.min(getVariantStock(product, size), MAX_LINE_QUANTITY);
    const key = cartKey(product.id, size);
    const currentQty = cart.find((item) => item.key === key)?.quantity || 0;

    if (available < 1) return { ok: false, reason: 'out_of_stock' };
    if (currentQty >= available) return { ok: false, reason: 'max_reached', available };

    const line = {
      key,
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl || product.images?.[0]?.url || '',
      size,
      stock: available,
    };

    setCart((prevCart) =>
      prevCart.some((item) => item.key === key)
        ? prevCart.map((item) =>
            item.key === key
              ? { ...line, quantity: Math.min(item.quantity + quantity, available) }
              : item
          )
        : [...prevCart, { ...line, quantity: Math.min(quantity, available) }]
    );

    return { ok: true, capped: currentQty + quantity > available, available };
  };

  const removeFromCart = (key) => {
    setCart((prevCart) => prevCart.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.min(quantity, item.stock || MAX_LINE_QUANTITY, MAX_LINE_QUANTITY) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const refreshCart = useCallback(async () => {
    const current = loadCart();
    if (current.length === 0) return;

    let products;
    try {
      const ids = [...new Set(current.map((item) => item.id))];
      products = (await productsAPI.getByIds(ids)).data;
    } catch {
      return;
    }
    const byId = new Map(products.map((p) => [p.id, p]));
    const notices = [];

    const next = [];
    for (const item of current) {
      const product = byId.get(item.id);
      if (!product) {
        notices.push(`${item.title} is no longer available and was removed.`);
        continue;
      }
      let size = item.size;
      if (product.category === 'clothing') {
        const sizes = product.sizes || [];
        if (!size && sizes.length === 1) size = sizes[0].size;
        if (!sizes.some((s) => s.size === size)) {
          notices.push(`${item.title} needs a size. Please add it again from the product page.`);
          continue;
        }
      }
      const available = Math.min(getVariantStock(product, size), MAX_LINE_QUANTITY);
      if (available < 1) {
        notices.push(`${item.title}${size ? ` (${size})` : ''} is out of stock and was removed.`);
        continue;
      }
      let quantity = item.quantity;
      if (quantity > available) {
        quantity = available;
        notices.push(`Only ${available} of ${item.title}${size ? ` (${size})` : ''} available. Quantity updated.`);
      }
      if (product.price !== item.price) {
        notices.push(`Price of ${item.title} changed to ₹${product.price}.`);
      }
      next.push({
        key: cartKey(item.id, size),
        id: item.id,
        title: product.title,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl || product.images?.[0]?.url || '',
        size,
        stock: available,
        quantity
      });
    }

    setCart(next);
    notices.forEach((message) => toast(message, { icon: 'ℹ️', duration: 6000 }));
    return notices;
  }, []);

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
