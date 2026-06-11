package com.techstore.controller;

import com.techstore.dto.LoginRequest;
import com.techstore.dto.RegisterRequest;
import com.techstore.dto.UserResponse;
import com.techstore.model.User;
import com.techstore.service.ServiceException;
import com.techstore.service.UserService;
import com.techstore.util.ResponseUtil;
import com.techstore.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        try {
            User user = userService.login(request.getEmail(), request.getPassword());
            SessionUtil.createSession(httpRequest, user.getUserId(), user.getRole(), user.getName());
            return ResponseUtil.success("Login successful", UserResponse.from(user), HttpStatus.OK);

        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return ResponseUtil.error("Login failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        try {
            User user = userService.registerUser(
                    request.getName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getPhone(),
                    request.getAddress());

            SessionUtil.createSession(httpRequest, user.getUserId(), user.getRole(), user.getName());
            return ResponseUtil.success("Registration successful", UserResponse.from(user), HttpStatus.CREATED);

        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Registration failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseUtil.success("Logged out successfully", null, HttpStatus.OK);
    }

    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> getSession(HttpServletRequest request) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("No active session", HttpStatus.UNAUTHORIZED);
        }

        try {
            User user = userService.getUserById(userId);
            return ResponseUtil.success("Session active", UserResponse.from(user), HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}

