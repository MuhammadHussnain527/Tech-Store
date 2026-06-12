package com.techstore.service;

import com.techstore.model.Notification;
import com.techstore.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void addNotification(int userId, String message, String type) throws ServiceException {
        try {
            notificationRepository.addNotification(userId, message, type);
        } catch (SQLException e) {
            throw new ServiceException("Failed to add notification", e);
        }
    }

    public List<Notification> getUserNotifications(int userId) throws ServiceException {
        try {
            return notificationRepository.getUserNotifications(userId);
        } catch (SQLException e) {
            throw new ServiceException("Failed to fetch notifications", e);
        }
    }

    public void markAsRead(int userId, int notificationId) throws ServiceException {
        try {
            notificationRepository.markAsRead(userId, notificationId);
        } catch (SQLException e) {
            throw new ServiceException("Failed to mark notification as read", e);
        }
    }

    public void markAllAsRead(int userId) throws ServiceException {
        try {
            notificationRepository.markAllAsRead(userId);
        } catch (SQLException e) {
            throw new ServiceException("Failed to mark all notifications as read", e);
        }
    }

    public int getUnreadCount(int userId) throws ServiceException {
        try {
            return notificationRepository.getUnreadCount(userId);
        } catch (SQLException e) {
            throw new ServiceException("Failed to get unread count", e);
        }
    }
}
