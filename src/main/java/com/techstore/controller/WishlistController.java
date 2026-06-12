package com.techstore.controller;
import com.techstore.dto.WishlistResponse;
import com.techstore.model.User;
import com.techstore.service.WishlistService;
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
@RequestMapping("/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWishlist(HttpServletRequest request) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Please login to view your wishlist", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            List<WishlistResponse> items = wishlistService.getUserWishlist(userId);
            return ResponseUtil.success("Wishlist retrieved", items, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addToWishlist(HttpServletRequest request, @RequestBody Map<String, Integer> payload) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Please login to add to wishlist", HttpStatus.UNAUTHORIZED);
        }
        
        Integer productId = payload.get("productId");
        if (productId == null) {
            return ResponseUtil.error("Product ID is required", HttpStatus.BAD_REQUEST);
        }
        
        try {
            wishlistService.addProductToWishlist(userId, productId);
            return ResponseUtil.success("Product added to wishlist", null, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> removeFromWishlist(HttpServletRequest request, @RequestParam("productId") int productId) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Please login to modify wishlist", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            wishlistService.removeProductFromWishlist(userId, productId);
            return ResponseUtil.success("Product removed from wishlist", null, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkWishlist(HttpServletRequest request, @RequestParam("productId") int productId) {
        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.success("Not logged in", false, HttpStatus.OK);
        }
        
        try {
            boolean inWishlist = wishlistService.isInWishlist(userId, productId);
            return ResponseUtil.success("Checked", inWishlist, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
