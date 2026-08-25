"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CartContextValue = {
  count: number;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue>({ count: 0, refresh: async () => {} });

export function Providers({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const data = await res.json();
      const items = data.cart?.items ?? [];
      setCount(items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
    } catch {
      /* guest cart may not exist yet */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ count, refresh }), [count, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartCount() {
  return useContext(CartContext);
}
