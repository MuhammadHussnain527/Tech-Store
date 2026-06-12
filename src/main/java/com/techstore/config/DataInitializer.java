package com.techstore.config;

import com.techstore.repository.UserRepository;
import com.techstore.model.User;
import com.techstore.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Runs once on application startup to ensure the default admin user exists.
 * Admin credentials: hussnain@techstore.com / Admin@1234
 */
@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private javax.sql.DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) {
        try {
            runSchemaMigrations();

            // Seed admin user if not already present
            ensureAdminExists(
                "Hussnain",
                "hussnain@techstore.com",
                "Admin@1234"
            );
        } catch (Exception e) {
            // Log but don't crash the app
            System.err.println("[DataInitializer] Failed to seed admin user: " + e.getMessage());
        }
    }

    private void ensureAdminExists(String name, String email, String password) throws Exception {
        User existing = userRepository.findByEmail(email);
        if (existing != null) {
            System.out.println("[DataInitializer] Admin user '" + email + "' already exists — skipping seed.");
            return;
        }

        User admin = new User();
        admin.setName(name);
        admin.setEmail(email);
        admin.setPasswordHash(PasswordUtil.hashPassword(password));
        admin.setRole("ADMIN");

        int id = userRepository.createUser(admin);
        if (id > 0) {
            System.out.println("[DataInitializer] Admin user created: " + email + " (id=" + id + ")");
        } else {
            System.err.println("[DataInitializer] Failed to insert admin user: " + email);
        }
    }

    private void runSchemaMigrations() {
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {

            // 1. Alter products
            try {
                stmt.execute("ALTER TABLE products ADD COLUMN discount_percentage INT DEFAULT 0, ADD COLUMN view_count INT DEFAULT 0");
                System.out.println("[DataInitializer] Added discount_percentage and view_count to products table.");
            } catch (Exception e) {
                // Ignore if already exists
            }

            // 2. Create wishlists
            stmt.execute("CREATE TABLE IF NOT EXISTS wishlists (" +
                    "wishlist_id INT AUTO_INCREMENT PRIMARY KEY," +
                    "user_id INT NOT NULL," +
                    "product_id INT NOT NULL," +
                    "added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE," +
                    "FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE," +
                    "UNIQUE KEY uk_wishlist_user_product (user_id, product_id)" +
                    ")");

            // 3. Create notifications
            stmt.execute("CREATE TABLE IF NOT EXISTS notifications (" +
                    "notification_id INT AUTO_INCREMENT PRIMARY KEY," +
                    "user_id INT NOT NULL," +
                    "message VARCHAR(500) NOT NULL," +
                    "is_read TINYINT(1) DEFAULT 0," +
                    "type VARCHAR(50) DEFAULT 'SYSTEM'," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE" +
                    ")");

            // 4. Create review_votes
            stmt.execute("CREATE TABLE IF NOT EXISTS review_votes (" +
                    "vote_id INT AUTO_INCREMENT PRIMARY KEY," +
                    "rating_id INT NOT NULL," +
                    "user_id INT NOT NULL," +
                    "vote_type VARCHAR(10) NOT NULL," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "FOREIGN KEY (rating_id) REFERENCES product_ratings(rating_id) ON DELETE CASCADE," +
                    "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE," +
                    "UNIQUE KEY uk_vote_user_rating (rating_id, user_id)" +
                    ")");

            // 5. Create order_tracking
            stmt.execute("CREATE TABLE IF NOT EXISTS order_tracking (" +
                    "tracking_id INT AUTO_INCREMENT PRIMARY KEY," +
                    "order_id INT NOT NULL," +
                    "status VARCHAR(50) NOT NULL," +
                    "comment VARCHAR(255)," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE" +
                    ")");

            System.out.println("[DataInitializer] Schema migrations completed.");
        } catch (Exception e) {
            System.err.println("[DataInitializer] Migration error: " + e.getMessage());
        }
    }
}
