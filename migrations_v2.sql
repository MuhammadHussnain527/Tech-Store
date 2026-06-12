-- 1. Modify products table
ALTER TABLE products 
ADD COLUMN discount_percentage INT DEFAULT 0,
ADD COLUMN view_count INT DEFAULT 0;

-- 2. Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY uk_wishlist_user_product (user_id, product_id)
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    type VARCHAR(50) DEFAULT 'SYSTEM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Create review_votes table
CREATE TABLE IF NOT EXISTS review_votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    rating_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- 'UP' or 'DOWN'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rating_id) REFERENCES product_ratings(rating_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_vote_user_rating (rating_id, user_id)
);

-- 5. Create order_tracking table
CREATE TABLE IF NOT EXISTS order_tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    comment VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
