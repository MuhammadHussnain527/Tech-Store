package com.techstore.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Product {

    private int productId;
    private int categoryId;
    private String name;
    private String description;
    private String brand;
    private BigDecimal price;
    private int stockQty;
    private String imageUrl;
    private String specs;
    private boolean active;
    private java.time.LocalDateTime createdAt;
    private double averageRating;
    
    // New fields
    private int discountPercentage;
    private int viewCount;

    public Product() {
    }

    public Product(
            int productId,
            int categoryId,
            String name,
            String description,
            String brand,
            BigDecimal price,
            int stockQty,
            String imageUrl,
            String specs,
            boolean active,
            LocalDateTime createdAt
    ) {
        this.productId = productId;
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
        this.brand = brand;
        this.price = price;
        this.stockQty = stockQty;
        this.imageUrl = imageUrl;
        this.specs = specs;
        this.active = active;
        this.createdAt = createdAt;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getStockQty() {
        return stockQty;
    }

    public void setStockQty(int stockQty) {
        this.stockQty = stockQty;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSpecs() {
        return specs;
    }

    public void setSpecs(String specs) {
        this.specs = specs;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(int discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public int getViewCount() {
        return viewCount;
    }

    public void setViewCount(int viewCount) {
        this.viewCount = viewCount;
    }
}
