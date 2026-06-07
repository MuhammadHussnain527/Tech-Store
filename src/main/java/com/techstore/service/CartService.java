package com.techstore.service;

import com.techstore.dao.CartDAO;
import com.techstore.dao.ProductDAO;
import com.techstore.model.CartItem;
import com.techstore.model.Product;

import java.sql.SQLException;
import java.util.List;

public class CartService {

    private final CartDAO cartDAO;
    private final ProductDAO productDAO;

    public CartService() {
        this.cartDAO = new CartDAO();
        this.productDAO = new ProductDAO();
    }

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

            Product product = productDAO.getProductById(productId);

            if (product == null) {
                throw new ServiceException("Product not found");
            }

            if (!product.isActive()) {
                throw new ServiceException("Product unavailable");
            }

            if (quantity > product.getStockQty()) {
                throw new ServiceException("Not enough stock available");
            }

            CartItem existingItem = cartDAO.getCartItem(
                    userId,
                    productId);

            if (existingItem != null) {

                int newQuantity = existingItem.getQuantity() + quantity;

                if (newQuantity > product.getStockQty()) {

                    throw new ServiceException("Not enough stock available");
                }

                cartDAO.updateQuantity(userId, productId, newQuantity);

            } else {

                cartDAO.addToCart(
                        userId,
                        productId,
                        quantity);
            }

        } catch (SQLException e) {

            throw new ServiceException("Unable to add item to cart", e);
        }
    }

    public List<CartItem> getCartItems(
            int userId) throws ServiceException {

        try {

            return cartDAO.getCartItems(userId);

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

            Product product = productDAO.getProductById(productId);

            if (product == null) {

                throw new ServiceException("Product not found");
            }

            if (quantity > product.getStockQty()) {

                throw new ServiceException("Not enough stock available");
            }

            boolean updated = cartDAO.updateQuantity(userId, productId, quantity);

            if (!updated) {

                throw new ServiceException("Cart item not found");
            }

        } catch (SQLException e) {

            throw new ServiceException("Unable to update cart", e);
        }
    }

    public void removeItem(int userId, int productId) throws ServiceException {

        try {

            boolean removed = cartDAO.removeItem(userId, productId);

            if (!removed) {

                throw new ServiceException("Cart item not found");
            }

        } catch (SQLException e) {

            throw new ServiceException("Unable to remove item", e);
        }
    }

    public void clearCart(int userId) throws ServiceException {

        try {

            cartDAO.clearCart(userId);

        } catch (SQLException e) {

            throw new ServiceException("Unable to clear cart", e);
        }
    }
}