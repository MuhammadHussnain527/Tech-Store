package com.techstore.controller;

import com.techstore.dto.CartItemResponse;
import com.techstore.service.CartService;
import com.techstore.service.ServiceException;
import com.techstore.util.ResponseUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCartItems(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
            }
            int userId = (Integer) session.getAttribute("userId");
            List<CartItemResponse> items = cartService.getCartItems(userId);
            return ResponseUtil.success("Cart loaded", items, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
            }
            int userId = (Integer) session.getAttribute("userId");
            int productId = ((Number) body.get("productId")).intValue();
            int quantity = ((Number) body.get("quantity")).intValue();

            cartService.addToCart(userId, productId, quantity);
            return ResponseUtil.success("Item added to cart", null, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateQuantity(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
            }
            int userId = (Integer) session.getAttribute("userId");
            int productId = ((Number) body.get("productId")).intValue();
            int quantity = ((Number) body.get("quantity")).intValue();

            cartService.updateQuantity(userId, productId, quantity);
            return ResponseUtil.success("Cart updated", null, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> removeItem(@RequestParam(required = false) Integer productId, HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
            }
            int userId = (Integer) session.getAttribute("userId");

            if (productId == null) {
                cartService.clearCart(userId);
                return ResponseUtil.success("Cart cleared", null, HttpStatus.OK);
            } else {
                cartService.removeItem(userId, productId);
                return ResponseUtil.success("Item removed", null, HttpStatus.OK);
            }
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

