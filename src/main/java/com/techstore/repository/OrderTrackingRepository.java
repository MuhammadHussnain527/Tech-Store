package com.techstore.repository;

import com.techstore.model.OrderTracking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class OrderTrackingRepository {

    @Autowired
    private DataSource dataSource;

    private static final String INSERT_SQL = "INSERT INTO order_tracking (order_id, status, comment) VALUES (?, ?, ?)";
    
    private static final String GET_BY_ORDER_SQL = "SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at ASC";

    public boolean addTrackingEvent(int orderId, String status, String comment) throws SQLException {
        try (Connection conn = dataSource.getConnection()) {
            return addTrackingEvent(conn, orderId, status, comment);
        }
    }

    public boolean addTrackingEvent(Connection conn, int orderId, String status, String comment) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement(INSERT_SQL)) {
            stmt.setInt(1, orderId);
            stmt.setString(2, status);
            stmt.setString(3, comment);
            return stmt.executeUpdate() > 0;
        }
    }

    public List<OrderTracking> getTrackingHistory(int orderId) throws SQLException {
        List<OrderTracking> history = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(GET_BY_ORDER_SQL)) {
            stmt.setInt(1, orderId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    OrderTracking t = new OrderTracking();
                    t.setTrackingId(rs.getInt("tracking_id"));
                    t.setOrderId(rs.getInt("order_id"));
                    t.setStatus(rs.getString("status"));
                    t.setComment(rs.getString("comment"));
                    t.setCreatedAt(rs.getTimestamp("created_at"));
                    history.add(t);
                }
            }
        }
        return history;
    }
}
