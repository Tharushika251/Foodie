// hooks/useCart.js
import { useState, useEffect } from 'react';
import { getCart, cartEvents } from '../utils/cartUtils';

export const useCart = () => {
    const [cart, setCart] = useState(getCart());

    useEffect(() => {
        const handleCartUpdate = (updatedCart) => {
            setCart(updatedCart);
        };

        // Listen for cart update events
        cartEvents.on('cartUpdated', handleCartUpdate);

        // Also listen for storage events from other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'orderDetails') {
                setCart(getCart());
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            cartEvents.off('cartUpdated', handleCartUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return cart;
};