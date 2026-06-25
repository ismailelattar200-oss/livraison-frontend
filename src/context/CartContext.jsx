import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('marea_cart');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('marea_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (menuItem, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === menuItem.id);
            if (existing) {
                return prev.map(item => 
                    item.id === menuItem.id 
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                );
            }
            return [...prev, { 
                id: menuItem.id, 
                name: menuItem.name, 
                price: parseFloat(menuItem.price), 
                image_url: menuItem.image_url,
                quantity 
            }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart(prev => prev.map(item => 
            item.id === itemId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
            isCartOpen, setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
