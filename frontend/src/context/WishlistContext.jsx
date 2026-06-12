import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useToast } from './ToastContext';
import { wishlistApi } from '../services/api';

const WishlistContext = createContext(null);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const data = await wishlistApi.getWishlist();
            const normalized = (data || []).map(item => ({
                ...item,
                name: item.productName || item.name,
                price: item.productPrice || item.price,
                imageUrl: item.productImageUrl || item.imageUrl
            }));
            setWishlist(normalized);
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleWishlist = async (product) => {
        if (!user) {
            toast('Please login to use wishlist', 'warning');
            return;
        }

        const isInWishlist = (wishlist || []).some(item => item.productId === product.productId);

        try {
            if (isInWishlist) {
                await wishlistApi.removeFromWishlist(product.productId);
                setWishlist(prev => prev.filter(item => item.productId !== product.productId));
                toast('Removed from wishlist', 'info');
            } else {
                await wishlistApi.addToWishlist(product.productId);
                setWishlist(prev => [{ ...product }, ...prev]);
                toast('Added to wishlist', 'success');
            }
        } catch (error) {
            toast(error.message || 'Failed to update wishlist', 'error');
        }
    };

    const isInWishlist = (productId) => {
        return (wishlist || []).some(item => item.productId === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, isLoading }}>
            {children}
        </WishlistContext.Provider>
    );
};
