package com.techstore.dao;

import com.techstore.model.CartItem;
import com.techstore.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import java.util.ArrayList;
import java.util.List;

public class CartDAO {

    private static final String GET_CART_ITEMS_SQL = "SELECT * FROM cart_items " +
            "WHERE user_id = ? " +
            "ORDER BY added_at DESC";

    private static final String GET_CART_ITEM_SQL = "SELECT * FROM cart_items " +
            "WHERE user_id = ? AND product_id = ?";

    private static final String ADD_TO_CART_SQL = "INSERT INTO cart_items (user_id, product_id, quantity) " +
            "VALUES (?, ?, ?)";

    private static final String UPDATE_QUANTITY_SQL = "UPDATE cart_items " +
            "SET quantity = ? " +
            "WHERE user_id = ? AND product_id = ?";

    private static final String REMOVE_ITEM_SQL = "DELETE FROM cart_items " +
            "WHERE user_id = ? AND product_id = ?";

    private static final String CLEAR_CART_SQL = "DELETE FROM cart_items " +
            "WHERE user_id = ?";

    public List<CartItem> getCartItems(int userId)
            throws SQLException {

        List<CartItem> items = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_CART_ITEMS_SQL)) {

            statement.setInt(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {

                while (resultSet.next()) {
                    items.add(mapRow(resultSet));
                }
            }
        }

        return items;
    }

    public CartItem getCartItem(
            int userId,
            int productId)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_CART_ITEM_SQL)) {

            statement.setInt(1, userId);
            statement.setInt(2, productId);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    public boolean addToCart(
            int userId,
            int productId,
            int quantity)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(ADD_TO_CART_SQL)) {

            statement.setInt(1, userId);
            statement.setInt(2, productId);
            statement.setInt(3, quantity);

            return statement.executeUpdate() > 0;
        }
    }

    public boolean updateQuantity(
            int userId,
            int productId,
            int quantity)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(UPDATE_QUANTITY_SQL)) {

            statement.setInt(1, quantity);
            statement.setInt(2, userId);
            statement.setInt(3, productId);

            return statement.executeUpdate() > 0;
        }
    }

    public boolean removeItem(
            int userId,
            int productId)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(REMOVE_ITEM_SQL)) {

            statement.setInt(1, userId);
            statement.setInt(2, productId);

            return statement.executeUpdate() > 0;
        }
    }

    // ----------------------------------------------------------------
    // Transactional overload — used inside OrderService transaction
    // ----------------------------------------------------------------

    public void clearCart(Connection connection, int userId)
            throws SQLException {

        try (PreparedStatement statement = connection.prepareStatement(CLEAR_CART_SQL)) {

            statement.setInt(1, userId);

            statement.executeUpdate();
        }
    }

    // Standalone version
    public boolean clearCart(int userId)
            throws SQLException {

        try (Connection connection = DBConnection.getConnection()) {

            clearCart(connection, userId);

            return true;
        }
    }

    private CartItem mapRow(ResultSet resultSet)
            throws SQLException {

        CartItem item = new CartItem();

        item.setCartItemId(
                resultSet.getInt("cart_item_id"));

        item.setUserId(
                resultSet.getInt("user_id"));

        item.setProductId(
                resultSet.getInt("product_id"));

        item.setQuantity(
                resultSet.getInt("quantity"));

        Timestamp addedAt = resultSet.getTimestamp("added_at");

        if (addedAt != null) {

            item.setAddedAt(
                    addedAt.toLocalDateTime());
        }

        return item;
    }
}