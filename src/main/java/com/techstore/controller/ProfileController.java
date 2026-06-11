package com.techstore.controller;

import com.techstore.dto.ProfileUpdateRequest;
import com.techstore.dto.UserResponse;
import com.techstore.model.User;
import com.techstore.service.ServiceException;
import com.techstore.service.UserService;
import com.techstore.util.ResponseUtil;
import com.techstore.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(HttpServletRequest request) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
        }

        try {
            User user = userService.getUserById(userId);
            return ResponseUtil.success("Profile loaded", UserResponse.from(user), HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody ProfileUpdateRequest body,
            HttpServletRequest request) {

        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
        }

        try {
            userService.updateProfile(userId, body.getName(), body.getPhone(), body.getAddress());
            User user = userService.getUserById(userId);

            HttpServletRequest httpRequest = request;
            var session = httpRequest.getSession(false);
            if (session != null) {
                session.setAttribute("userName", user.getName());
            }

            return ResponseUtil.success("Profile updated", UserResponse.from(user), HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

