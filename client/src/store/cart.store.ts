import { create } from 'zustand';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  photo: string;
  shopId: string;
  shopName: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find(i => i.productId === item.productId);
    if (existing) {
      set({ items: get().items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ items: [...get().items, item] });
    }
  },
  removeItem: (productId) => set({ items: get().items.filter(i => i.productId !== productId) }),
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter(i => i.productId !== productId) });
    } else {
      set({ items: get().items.map(i => i.productId === productId ? { ...i, quantity } : i) });
    }
  },
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
