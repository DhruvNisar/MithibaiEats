import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, FoodItem } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart;
  addItem: (foodItem: FoodItem, quantity: number, customizations?: Record<string, string>) => boolean;
  removeItem: (foodItemId: string, customizations?: Record<string, string>) => void;
  updateQuantity: (foodItemId: string, quantity: number, customizations?: Record<string, string>) => void;
  clearCart: () => void;
  getItemQuantity: (foodItemId: string) => number;
  setFulfillmentType: (type: 'pickup' | 'delivery') => void;
}

const defaultCart: Cart = {
  canteenId: '',
  canteenName: '',
  items: [],
  fulfillmentType: 'pickup',
  deliveryFee: 0,
  subtotal: 0,
  platformFee: 5,
  packagingFee: 3,
  total: 0
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : defaultCart;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const calculateTotals = (items: CartItem[], fulfillmentType: 'pickup' | 'delivery' = cart.fulfillmentType || 'pickup') => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = fulfillmentType === 'delivery' ? 10 : 0;
    const total = items.length > 0 ? subtotal + cart.platformFee + cart.packagingFee + deliveryFee : 0;
    return { subtotal, deliveryFee, total };
  };

  const addItem = (foodItem: FoodItem, quantity: number, customizations: Record<string, string> = {}) => {
    const canteenId = typeof foodItem.canteen === 'string' ? foodItem.canteen : foodItem.canteen._id;
    const canteenName = typeof foodItem.canteen === 'string' ? 'Canteen' : foodItem.canteen.name;
    
    if (cart.items.length > 0 && cart.canteenId !== canteenId) {
      toast.error('You can only order from one canteen at a time. Please clear your cart first.');
      return false;
    }

    setCart(prev => {
      const existingItemIndex = prev.items.findIndex(
        item => item.foodItem._id === foodItem._id && JSON.stringify(item.customizations) === JSON.stringify(customizations)
      );

      let newItems = [...prev.items];
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex].quantity += quantity;
        newItems[existingItemIndex].subtotal = newItems[existingItemIndex].quantity * foodItem.price;
      } else {
        newItems.push({
          foodItem,
          quantity,
          customizations,
          subtotal: quantity * foodItem.price
        });
      }

      const { subtotal, total } = calculateTotals(newItems);
      return {
        ...prev,
        canteenId,
        canteenName,
        items: newItems,
        subtotal,
        total
      };
    });
    
    toast.success(`Added ${foodItem.name} to cart`);
    return true;
  };

  const removeItem = (foodItemId: string, customizations: Record<string, string> = {}) => {
    setCart(prev => {
      const newItems = prev.items.filter(
        item => !(item.foodItem._id === foodItemId && JSON.stringify(item.customizations) === JSON.stringify(customizations))
      );
      
      if (newItems.length === 0) {
        return defaultCart;
      }
      
      const { subtotal, total } = calculateTotals(newItems);
      return { ...prev, items: newItems, subtotal, total };
    });
  };

  const updateQuantity = (foodItemId: string, quantity: number, customizations: Record<string, string> = {}) => {
    if (quantity <= 0) {
      removeItem(foodItemId, customizations);
      return;
    }

    setCart(prev => {
      const newItems = prev.items.map(item => {
        if (item.foodItem._id === foodItemId && JSON.stringify(item.customizations) === JSON.stringify(customizations)) {
          return { ...item, quantity, subtotal: quantity * item.foodItem.price };
        }
        return item;
      });

      const { subtotal, total } = calculateTotals(newItems);
      return { ...prev, items: newItems, subtotal, total };
    });
  };

  const clearCart = () => setCart(defaultCart);

  const getItemQuantity = (foodItemId: string) => {
    return cart.items
      .filter(item => item.foodItem._id === foodItemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const setFulfillmentType = (fulfillmentType: 'pickup' | 'delivery') => {
    setCart(prev => {
      const { subtotal, deliveryFee, total } = calculateTotals(prev.items, fulfillmentType);
      return { ...prev, fulfillmentType, deliveryFee, subtotal, total };
    });
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, getItemQuantity, setFulfillmentType }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
