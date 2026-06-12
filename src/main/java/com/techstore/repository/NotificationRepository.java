package com.techstore.repository;

import com.techstore.model.Notification;
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
public class NotificationRepository {

    @Autowired
    private DataSource dataSource;

    private static final String INSERT_SQL = "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)";
    
    private static final String GET_USER_NOTIFICATIONS_SQL = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
    
    private static final String MARK_READ_SQL = "UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?";
    
    private static final String MARK_ALL_READ_SQL = "UPDATE notifications SET is_read = 1 WHERE user_id = ?";
    
    private static final String COUNT_UNREAD_SQL = "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0";

    public boolean addNotification(int userId, String message, String type) throws SQLException {
        try (Connection conn = dataSource.getConnection()) {
            return addNotification(conn, userId, message, type);
        }
    }

    public boolean addNotification(Connection conn, int userId, String message, String type) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement(INSERT_SQL)) {
            stmt.setInt(1, userId);
            stmt.setString(2, message);
            stmt.setString(3, type);
            return stmt.executeUpdate() > 0;
        }
    }

    public List<Notification> getUserNotifications(int userId) throws SQLException {
        List<Notification> notifications = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(GET_USER_NOTIFICATIONS_SQL)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Notification n = new Notification();
                    n.setNotificationId(rs.getInt("notification_id"));
                    n.setUserId(rs.getInt("user_id"));
                    n.setMessage(rs.getString("message"));
                    n.setRead(rs.getBoolean("is_read"));
                    n.setType(rs.getString("type"));
                    n.setCreatedAt(rs.getTimestamp("created_at"));
                    notifications.add(n);
                }
            }
        }
        return notifications;
    }

    public boolean markAsRead(int userId, int notificationId) throws SQLException {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(MARK_READ_SQL)) {
            stmt.setInt(1, notificationId);
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean markAllAsRead(int userId) throws SQLException {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(MARK_ALL_READ_SQL)) {
            stmt.setInt(1, userId);
            return stmt.executeUpdate() > 0;
        }
    }

    public int getUnreadCount(int userId) throws SQLException {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(COUNT_UNREAD_SQL)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }
}
