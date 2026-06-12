package com.techstore.controller;
import com.techstore.model.Notification;
import com.techstore.model.User;
import com.techstore.service.NotificationService;
import com.techstore.util.ResponseUtil;
import com.techstore.util.SessionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(HttpServletRequest request) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Please login to view notifications", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseUtil.success("Notifications retrieved", notifications, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(HttpServletRequest request) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.success("Not logged in", 0, HttpStatus.OK);
        }
        
        try {
            int count = notificationService.getUnreadCount(userId);
            return ResponseUtil.success("Count retrieved", count, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(HttpServletRequest request, @PathVariable("id") int id) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Please login", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            notificationService.markAsRead(userId, id);
            return ResponseUtil.success("Marked as read", null, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(HttpServletRequest request) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Please login", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            notificationService.markAllAsRead(userId);
            return ResponseUtil.success("All marked as read", null, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
