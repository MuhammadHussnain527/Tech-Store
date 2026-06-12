package com.techstore.repository;

import com.techstore.dto.WishlistResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class WishlistRepository {

    @Autowired
    private DataSource dataSource;

    private static final String ADD_SQL = "INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)";

    private static final String REMOVE_SQL = "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?";

    private static final String GET_USER_WISHLIST_SQL = "SELECT w.wishlist_id, p.product_id, p.name, p.price, p.image_url, p.discount_percentage, w.added_at "
            +
            "FROM wishlists w " +
            "JOIN products p ON w.product_id = p.product_id " +
            "WHERE w.user_id = ? " +
            "ORDER BY w.added_at DESC";

    private static final String GET_ALL_WISHLISTS_ADMIN_SQL = "SELECT u.name as user_name, u.email as user_email, p.product_id, p.name as product_name, w.added_at "
            +
            "FROM wishlists w " +
            "JOIN users u ON w.user_id = u.user_id " +
            "JOIN products p ON w.product_id = p.product_id " +
            "ORDER BY w.added_at DESC";

    private static final String CHECK_EXISTS_SQL = "SELECT COUNT(*) FROM wishlists WHERE user_id = ? AND product_id = ?";

    public boolean addProductToWishlist(int userId, int productId) throws SQLException {
        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(ADD_SQL)) {
            stmt.setInt(1, userId);
            stmt.setInt(2, productId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean removeProductFromWishlist(int userId, int productId) throws SQLException {
        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(REMOVE_SQL)) {
            stmt.setInt(1, userId);
            stmt.setInt(2, productId);
            return stmt.executeUpdate() > 0;
        }
    }

    public List<WishlistResponse> getUserWishlist(int userId) throws SQLException {
        List<WishlistResponse> wishlist = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(GET_USER_WISHLIST_SQL)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    WishlistResponse item = new WishlistResponse();
                    item.setWishlistId(rs.getInt("wishlist_id"));
                    item.setProductId(rs.getInt("product_id"));
                    item.setProductName(rs.getString("name"));
                    item.setProductPrice(rs.getBigDecimal("price"));
                    item.setProductImageUrl(rs.getString("image_url"));
                    try {
                        item.setDiscountPercentage(rs.getInt("discount_percentage"));
                    } catch (SQLException ignored) {
                    }
                    item.setAddedAt(rs.getTimestamp("added_at"));
                    wishlist.add(item);
                }
            }
        }
        return wishlist;
    }

    public List<com.techstore.dto.WishlistAdminResponse> getAllWishlistsAdmin() throws SQLException {
        List<com.techstore.dto.WishlistAdminResponse> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(GET_ALL_WISHLISTS_ADMIN_SQL);
                ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                com.techstore.dto.WishlistAdminResponse item = new com.techstore.dto.WishlistAdminResponse();
                item.setUserName(rs.getString("user_name"));
                item.setUserEmail(rs.getString("user_email"));
                item.setProductId(rs.getInt("product_id"));
                item.setProductName(rs.getString("product_name"));
                item.setAddedAt(rs.getTimestamp("added_at"));
                list.add(item);
            }
        }
        return list;
    }

    public boolean exists(int userId, int productId) throws SQLException {
        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(CHECK_EXISTS_SQL)) {
            stmt.setInt(1, userId);
            stmt.setInt(2, productId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }
}
