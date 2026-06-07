package com.techstore.dao;

import com.techstore.model.Order;
import com.techstore.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

import java.util.ArrayList;
import java.util.List;

public class OrderDAO {

    private static final String INSERT_ORDER_SQL = "INSERT INTO orders " +
            "(user_id, total_price, status, shipping_name, " +
            "shipping_address, shipping_phone, payment_method) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?)";

    private static final String GET_ORDER_BY_ID_SQL = "SELECT * FROM orders WHERE order_id = ?";

    private static final String GET_USER_ORDERS_SQL = "SELECT * FROM orders " +
            "WHERE user_id = ? " +
            "ORDER BY order_date DESC";

    private static final String GET_ALL_ORDERS_SQL = "SELECT * FROM orders " +
            "ORDER BY order_date DESC";

    private static final String UPDATE_STATUS_SQL = "UPDATE orders " +
            "SET status = ? " +
            "WHERE order_id = ?";

    public int createOrder(Order order)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(
                        INSERT_ORDER_SQL,
                        Statement.RETURN_GENERATED_KEYS)) {

            statement.setObject(1, order.getUserId());
            statement.setBigDecimal(2, order.getTotalPrice());
            statement.setString(3, order.getStatus());
            statement.setString(4, order.getShippingName());
            statement.setString(5, order.getShippingAddress());
            statement.setString(6, order.getShippingPhone());
            statement.setString(7, order.getPaymentMethod());

            int affectedRows = statement.executeUpdate();

            if (affectedRows == 0) {
                return 0;
            }

            try (ResultSet keys = statement.getGeneratedKeys()) {

                if (keys.next()) {
                    return keys.getInt(1);
                }
            }
        }

        return 0;
    }

    public Order getOrderById(int orderId)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(
                        GET_ORDER_BY_ID_SQL)) {

            statement.setInt(1, orderId);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    public List<Order> getOrdersByUser(int userId)
            throws SQLException {

        List<Order> orders = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(
                        GET_USER_ORDERS_SQL)) {

            statement.setInt(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {

                while (resultSet.next()) {
                    orders.add(mapRow(resultSet));
                }
            }
        }

        return orders;
    }

    public List<Order> getAllOrders()
            throws SQLException {

        List<Order> orders = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(
                        GET_ALL_ORDERS_SQL);
                ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                orders.add(mapRow(resultSet));
            }
        }

        return orders;
    }

    public boolean updateOrderStatus(
            int orderId,
            String status) throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(
                        UPDATE_STATUS_SQL)) {

            statement.setString(1, status);
            statement.setInt(2, orderId);

            return statement.executeUpdate() > 0;
        }
    }

    private Order mapRow(ResultSet resultSet)
            throws SQLException {

        Order order = new Order();

        order.setOrderId(
                resultSet.getInt("order_id"));

        order.setUserId(
                (Integer) resultSet.getObject("user_id"));

        order.setTotalPrice(
                resultSet.getBigDecimal("total_price"));

        order.setStatus(
                resultSet.getString("status"));

        order.setShippingName(
                resultSet.getString("shipping_name"));

        order.setShippingAddress(
                resultSet.getString("shipping_address"));

        order.setShippingPhone(
                resultSet.getString("shipping_phone"));

        order.setPaymentMethod(
                resultSet.getString("payment_method"));

        Timestamp orderDate = resultSet.getTimestamp("order_date");

        if (orderDate != null) {
            order.setOrderDate(
                    orderDate.toLocalDateTime());
        }

        Timestamp updatedAt = resultSet.getTimestamp("updated_at");

        if (updatedAt != null) {
            order.setUpdatedAt(
                    updatedAt.toLocalDateTime());
        }

        return order;
    }
}