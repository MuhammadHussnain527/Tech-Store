package com.techstore.service;

import com.techstore.repository.CartRepository;
import com.techstore.repository.ProductRepository;
import com.techstore.dto.CartItemResponse;
import com.techstore.model.CartItem;
import com.techstore.model.Product;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.sql.SQLException;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository CartRepository;

    @Autowired
    private ProductRepository ProductRepository;

    public void addToCart(
            int userId,
            int productId,
            int quantity) throws ServiceException {

        try {

            if (userId <= 0) {
                throw new ServiceException("Invalid user");
            }

            if (productId <= 0) {
                throw new ServiceException("Invalid product");
            }

            if (quantity <= 0) {
                throw new ServiceException("Quantity must be greater than zero");
            }

            Product product = ProductRepository.getProductById(productId);

            if (product == null) {
                throw new ServiceException("Product not found");
            }

            if (!product.isActive()) {
                throw new ServiceException("Product unavailable");
            }

            if (quantity > product.getStockQty()) {
                throw new ServiceException("Not enough stock available");
            }

            CartItem existingItem = CartRepository.getCartItem(
                    userId,
                    productId);

            if (existingItem != null) {

                int newQuantity = existingItem.getQuantity() + quantity;

                if (newQuantity > product.getStockQty()) {

                    throw new ServiceException("Not enough stock available");
                }

                CartRepository.updateQuantity(userId, productId, newQuantity);

            } else {

                CartRepository.addToCart(
                        userId,
                        productId,
                        quantity);
            }

        } catch (SQLException e) {

            throw new ServiceException("Unable to add item to cart", e);
        }
    }

    public List<CartItemResponse> getCartItems(int userId) throws ServiceException {
        try {
            return CartRepository.getEnrichedCartItems(userId);
        } catch (SQLException e) {
            throw new ServiceException("Unable to load cart", e);
        }
    }

    public void updateQuantity(
            int userId,
            int productId,
            int quantity) throws ServiceException {

        try {

            if (quantity <= 0) {

                throw new ServiceException("Quantity must be greater than zero");
            }

            Product product = ProductRepository.getProductById(productId);

            if (product == null) {

                throw new ServiceException("Product not found");
            }

            if (quantity > product.getStockQty()) {

                throw new ServiceException("Not enough stock available");
            }

            boolean updated = CartRepository.updateQuantity(userId, productId, quantity);

            if (!updated) {

                throw new ServiceException("Cart item not found");
            }

        } catch (SQLException e) {

            throw new ServiceException("Unable to update cart", e);
        }
    }

    public void removeItem(int userId, int productId) throws ServiceException {

        try {

            boolean removed = CartRepository.removeItem(userId, productId);

            if (!removed) {

                throw new ServiceException("Cart item not found");
            }

        } catch (SQLException e) {

            throw new ServiceException("Unable to remove item", e);
        }
    }

    public void clearCart(int userId) throws ServiceException {

        try {

            CartRepository.clearCart(userId);

        } catch (SQLException e) {

            throw new ServiceException("Unable to clear cart", e);
        }
    }
}
