
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const FavoriteContext = createContext(undefined);

export function FavoriteProvider({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn) {
      setFavorites([]);
      return;
    }

    let cancelled = false;

    async function loadFavorites() {
      try {
        const res = await fetch("/api/favorites");

        if (!res.ok) {
          throw new Error(
            `Gagal memuat favorites (HTTP ${res.status})`
          );
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Respons favorites bukan berupa array."
          );
        }

        if (!cancelled) {
          setFavorites(data);
        }
      } catch (error) {
        console.error("Gagal memuat favorites:", error);

        if (!cancelled) {
          setFavorites([]);
        }
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, loading]);

  async function addFavorite(user) {
    if (!isLoggedIn) {
      alert("Silakan login terlebih dahulu untuk menambahkan favorite.");
      return;
    }

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      if (!res.ok) {
        throw new Error(
          `Gagal menambahkan favorite (HTTP ${res.status})`
        );
      }

      const saved = await res.json();

      setFavorites((prev) => {
        const alreadyExists = prev.some(
          (item) => item.user_id === saved.user_id
        );

        return alreadyExists ? prev : [...prev, saved];
      });
    } catch (error) {
      console.error("Gagal menambahkan favorite:", error);
      alert("Gagal menambahkan favorite. Silakan coba lagi.");
    }
  }

  async function removeFavorite(userId) {
    try {
      const res = await fetch(`/api/favorites/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(
          `Gagal menghapus favorite (HTTP ${res.status})`
        );
      }

      setFavorites((prev) =>
        prev.filter((item) => item.user_id !== userId)
      );
    } catch (error) {
      console.error("Gagal menghapus favorite:", error);
      alert("Gagal menghapus favorite. Silakan coba lagi.");
    }
  }

  function isFavorite(userId) {
    return favorites.some(
      (item) => item.user_id === userId
    );
  }

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(FavoriteContext);

  if (context === undefined) {
    throw new Error(
      "useFavorite harus dipakai di dalam <FavoriteProvider>"
    );
  }

  return context;
}
