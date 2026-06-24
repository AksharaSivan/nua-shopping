import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface CartItem {
  id: string; // unique ID: `${productId}-${color}-${size}`
  productId: number;
  title: string;
  price: number;
  brand: string;
  image: string;
  color: string;
  colorHex: string;
  filterClass: string;
  size: string;
  quantity: number;
  maxStock: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'REHYDRATE'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'quantity' | 'id'>; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  isAddingToCart: boolean;
  toasts: Toast[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity' | 'id'>, quantity: number) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'REHYDRATE':
      return { items: action.payload };

    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const itemId = `${item.productId}-${item.color}-${item.size}`;

      const existingIndex = state.items.findIndex(i => i.id === itemId);

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingIndex];
        const newQty = Math.min(existingItem.quantity + quantity, item.maxStock);
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newQty
        };
        return { items: updatedItems };
      } else {
        return {
          items: [
            ...state.items,
            {
              ...item,
              id: itemId,
              quantity: Math.min(quantity, item.maxStock)
            }
          ]
        };
      }
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      return {
        items: state.items.map(item => {
          if (item.id === id) {
            const cappedQty = Math.max(1, Math.min(quantity, item.maxStock));
            return { ...item, quantity: cappedQty };
          }
          return item;
        })
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localCart, setLocalCart] = useLocalStorage<CartItem[]>('nua-cart', []);
  const [state, dispatch] = useReducer(cartReducer, { items: localCart });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Synchronize state changes to localStorage
  useEffect(() => {
    setLocalCart(state.items);
  }, [state.items, setLocalCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Mock Async API Add to Cart (with simulated latency and random failure)
  const addToCart = async (item: Omit<CartItem, 'quantity' | 'id'>, quantity: number): Promise<boolean> => {
    setIsAddingToCart(true);

    try {
      // Simulate API latency (600ms - 1000ms)
      const latency = Math.floor(Math.random() * 400) + 600;
      await new Promise((resolve) => setTimeout(resolve, latency));

      // Simulate a random failure (10% probability)
      const isFailure = Math.random() < 0.1;
      if (isFailure) {
        throw new Error("Network error during cart sync");
      }

      dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
      triggerToast(`Added ${quantity}x ${item.title} to cart.`, 'success');
      return true;
    } catch (error) {
      console.error("Cart API Error:", error);
      triggerToast(`Failed to add item. Random network simulated failure.`, 'error');
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    const item = state.items.find(i => i.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    if (item) {
      triggerToast(`Removed ${item.title} from cart.`, 'info');
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isCartOpen,
        isAddingToCart,
        toasts,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        triggerToast,
        removeToast
      }}
    >
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
