package com.techstore.service;

import com.techstore.dto.WishlistResponse;
import com.techstore.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    public void addProductToWishlist(int userId, int productId) throws ServiceException {
        try {
            wishlistRepository.addProductToWishlist(userId, productId);
        } catch (SQLException e) {
            throw new ServiceException("Failed to add product to wishlist", e);
        }
    }

    public void removeProductFromWishlist(int userId, int productId) throws ServiceException {
        try {
            wishlistRepository.removeProductFromWishlist(userId, productId);
        } catch (SQLException e) {
            throw new ServiceException("Failed to remove product from wishlist", e);
        }
    }

    public List<WishlistResponse> getUserWishlist(int userId) throws ServiceException {
        try {
            return wishlistRepository.getUserWishlist(userId);
        } catch (SQLException e) {
            throw new ServiceException("Failed to load wishlist", e);
        }
    }

    public List<com.techstore.dto.WishlistAdminResponse> getAllWishlistsAdmin() throws ServiceException {
        try {
            return wishlistRepository.getAllWishlistsAdmin();
        } catch (SQLException e) {
            throw new ServiceException("Unable to load all wishlists", e);
        }
    }
    
    public boolean isInWishlist(int userId, int productId) throws ServiceException {
        try {
            return wishlistRepository.exists(userId, productId);
        } catch (SQLException e) {
            throw new ServiceException("Failed to check wishlist status", e);
        }
    }
}
