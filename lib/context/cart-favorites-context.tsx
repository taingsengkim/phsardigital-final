"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCarts } from "@/app/api/cart";
import { getFavorites } from "@/app/api/favorites";
import { useSession } from "@/lib/auth-client";

interface CartFavoritesContextType {
  cartCount: number;
  savedCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const CartFavoritesContext = createContext<CartFavoritesContextType>({
  cartCount: 0,
  savedCount: 0,
  isLoading: false,
  refreshCart: async () => {},
  refreshFavorites: async () => {},
  refreshAll: async () => {},
});

export const CartFavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  const refreshCart = useCallback(async () => {
    try {
      const vendorCarts = await getCarts();
      if (Array.isArray(vendorCarts)) {
        const total = vendorCarts.reduce(
          (sum, c) => sum + (c.items ? c.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0),
          0
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      const favorites = await getFavorites();
      if (Array.isArray(favorites)) {
        setSavedCount(favorites.length);
      } else {
        setSavedCount(0);
      }
    } catch {
      setSavedCount(0);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([refreshCart(), refreshFavorites()]);
    setIsLoading(false);
  }, [refreshCart, refreshFavorites]);

  useEffect(() => {
    refreshAll();
  }, [session?.user, refreshAll]);

  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };
    const handleFavoritesUpdate = () => {
      refreshFavorites();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("favorites-updated", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("favorites-updated", handleFavoritesUpdate);
    };
  }, [refreshCart, refreshFavorites]);

  return (
    <CartFavoritesContext.Provider
      value={{
        cartCount,
        savedCount,
        isLoading,
        refreshCart,
        refreshFavorites,
        refreshAll,
      }}
    >
      {children}
    </CartFavoritesContext.Provider>
  );
};

export const useCartFavorites = () => useContext(CartFavoritesContext);
