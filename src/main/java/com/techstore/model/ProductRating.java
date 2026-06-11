package com.techstore.model;

import java.time.LocalDateTime;

public class ProductRating {

    private int ratingId;
    private int productId;
    private int userId;
    private int rating;
    private String reviewText;
    private LocalDateTime createdAt;

    public ProductRating() {
    }

    public ProductRating(
            int ratingId,
            int productId,
            int userId,
            int rating,
            String reviewText,
            LocalDateTime createdAt) {
        this.ratingId = ratingId;
        this.productId = productId;
        this.userId = userId;
        this.rating = rating;
        this.reviewText = reviewText;
        this.createdAt = createdAt;
    }

    public int getRatingId() {
        return ratingId;
    }

    public void setRatingId(int ratingId) {
        this.ratingId = ratingId;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
