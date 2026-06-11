package com.techstore.controller;

import com.techstore.dto.RatingRequest;
import com.techstore.dto.RatingResponse;
import com.techstore.service.RatingService;
import com.techstore.service.ServiceException;
import com.techstore.util.ResponseUtil;
import com.techstore.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @GetMapping("/{productId}/ratings")
    public ResponseEntity<Map<String, Object>> getRatings(@PathVariable int productId) {
        try {
            List<RatingResponse> ratings = ratingService.getRatingsByProduct(productId);
            return ResponseUtil.success("Ratings loaded", ratings, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{productId}/ratings")
    public ResponseEntity<Map<String, Object>> submitRating(
            @PathVariable int productId,
            @RequestBody RatingRequest body,
            HttpServletRequest request) {

        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
        }

        try {
            ratingService.submitRating(productId, userId, body.getRating(), body.getReviewText());
            RatingResponse rating = ratingService.getUserRating(productId, userId);
            return ResponseUtil.success("Rating submitted", rating, HttpStatus.CREATED);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{productId}/ratings")
    public ResponseEntity<Map<String, Object>> updateRating(
            @PathVariable int productId,
            @RequestBody RatingRequest body,
            HttpServletRequest request) {

        Integer userId = SessionUtil.getUserId(request);
        if (userId == null) {
            return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
        }

        try {
            ratingService.submitRating(productId, userId, body.getRating(), body.getReviewText());
            RatingResponse rating = ratingService.getUserRating(productId, userId);
            return ResponseUtil.success("Rating updated", rating, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

