import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface FavoriteItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  addedAt: number;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (id: number, type: "movie" | "tv") => boolean;
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: number, type: "movie" | "tv") => void;
  toggleFavorite: (item: FavoriteItem) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = "mr_films_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setFavorites(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  const saveFavorites = useCallback((items: FavoriteItem[]) => {
    setFavorites(items);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const isFavorite = useCallback(
    (id: number, type: "movie" | "tv") =>
      favorites.some((f) => f.id === id && f.type === type),
    [favorites]
  );

  const addFavorite = useCallback(
    (item: FavoriteItem) => {
      if (!isFavorite(item.id, item.type)) {
        saveFavorites([{ ...item, addedAt: Date.now() }, ...favorites]);
      }
    },
    [favorites, isFavorite, saveFavorites]
  );

  const removeFavorite = useCallback(
    (id: number, type: "movie" | "tv") => {
      saveFavorites(favorites.filter((f) => !(f.id === id && f.type === type)));
    },
    [favorites, saveFavorites]
  );

  const toggleFavorite = useCallback(
    (item: FavoriteItem) => {
      if (isFavorite(item.id, item.type)) {
        removeFavorite(item.id, item.type);
      } else {
        addFavorite(item);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
