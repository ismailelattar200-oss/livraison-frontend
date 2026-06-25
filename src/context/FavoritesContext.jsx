import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
    return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const item = window.localStorage.getItem('marea_favorites');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Error reading favorites from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('marea_favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error("Error saving favorites to localStorage", error);
        }
    }, [favorites]);

    const toggleFavorite = (id) => {
        setFavorites((prev) => {
            if (prev.includes(id)) {
                return prev.filter(f => f !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const isFavorite = (id) => {
        return favorites.includes(id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
