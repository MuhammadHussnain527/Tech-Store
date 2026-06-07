package com.techstore.dao;

import com.techstore.model.OrderItem;
import com.techstore.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.util.ArrayList;
import java.util.List;

public class OrderItemDAO {

    private static final String INSERT_ORDER_ITEM_SQL = "INSERT INTO order_items " +
            "(order_id, product_id, product_name, quantity, unit_price, subtotal) " +
            "VALUES (?, ?, ?, ?, ?, ?)";

    private static final String GET_ORDER_ITEMS_SQL = "SELECT * FROM order_items WHERE order_id = ?";

    public boolean addOrderItem(OrderItem orderItem)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(INSERT_ORDER_ITEM_SQL)) {

            statement.setInt(1, orderItem.getOrderId());
            statement.setObject(2, orderItem.getProductId());
            statement.setString(3, orderItem.getProductName());
            statement.setInt(4, orderItem.getQuantity());
            statement.setBigDecimal(5, orderItem.getUnitPrice());
            statement.setBigDecimal(6, orderItem.getSubtotal());

            return statement.executeUpdate() > 0;
        }
    }

    public List<OrderItem> getOrderItemsByOrderId(int orderId)
            throws SQLException {

        List<OrderItem> items = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_ORDER_ITEMS_SQL)) {

            statement.setInt(1, orderId);

            try (ResultSet resultSet = statement.executeQuery()) {

                while (resultSet.next()) {
                    items.add(mapRow(resultSet));
                }
            }
        }

        return items;
    }

    private OrderItem mapRow(ResultSet resultSet)
            throws SQLException {

        OrderItem item = new OrderItem();

        item.setOrderItemId(
                resultSet.getInt("order_item_id"));

        item.setOrderId(
                resultSet.getInt("order_id"));

        item.setProductId(
                (Integer) resultSet.getObject("product_id"));

        item.setProductName(
                resultSet.getString("product_name"));

        item.setQuantity(
                resultSet.getInt("quantity"));

        item.setUnitPrice(
                resultSet.getBigDecimal("unit_price"));

        item.setSubtotal(
                resultSet.getBigDecimal("subtotal"));

        return item;
    }
}