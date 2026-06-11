package com.techstore.repository;

import com.techstore.model.ProductRating;
import org.springframework.stereotype.Repository;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import java.util.ArrayList;
import java.util.List;

@Repository
public class RatingRepository {

    @Autowired
    private DataSource dataSource;

    private static final String INSERT_SQL = "INSERT INTO product_ratings " +
            "(product_id, user_id, rating, review_text) " +
            "VALUES (?, ?, ?, ?)";

    private static final String GET_PRODUCT_RATINGS_SQL = "SELECT * FROM product_ratings " +
            "WHERE product_id = ? " +
            "ORDER BY created_at DESC";

    private static final String GET_USER_RATING_SQL = "SELECT * FROM product_ratings " +
            "WHERE product_id = ? AND user_id = ?";

    private static final String UPDATE_RATING_SQL = "UPDATE product_ratings " +
            "SET rating = ?, review_text = ? " +
            "WHERE product_id = ? AND user_id = ?";

    private static final String DELETE_RATING_SQL = "DELETE FROM product_ratings " +
            "WHERE rating_id = ?";

    private static final String GET_AVERAGE_SQL = "SELECT AVG(rating) AS avg_rating " +
            "FROM product_ratings " +
            "WHERE product_id = ?";

    public boolean addRating(ProductRating rating)
            throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {

            statement.setInt(1, rating.getProductId());
            statement.setInt(2, rating.getUserId());
            statement.setInt(3, rating.getRating());
            statement.setString(4, rating.getReviewText());

            return statement.executeUpdate() > 0;
        }
    }

    public ProductRating getUserRating(int productId, int userId) throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_USER_RATING_SQL)) {

            statement.setInt(1, productId);
            statement.setInt(2, userId);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    public List<ProductRating> getRatingsByProduct(int productId) throws SQLException {

        List<ProductRating> ratings = new ArrayList<>();

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_PRODUCT_RATINGS_SQL)) {

            statement.setInt(1, productId);

            try (ResultSet resultSet = statement.executeQuery()) {

                while (resultSet.next()) {
                    ratings.add(mapRow(resultSet));
                }
            }
        }

        return ratings;
    }

    public boolean updateRating(ProductRating rating) throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(UPDATE_RATING_SQL)) {

            statement.setInt(1, rating.getRating());

            statement.setString(2, rating.getReviewText());

            statement.setInt(3, rating.getProductId());

            statement.setInt(4, rating.getUserId());

            return statement.executeUpdate() > 0;
        }
    }

    public boolean deleteRating(int ratingId) throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(DELETE_RATING_SQL)) {

            statement.setInt(1, ratingId);

            return statement.executeUpdate() > 0;
        }
    }

    public double getAverageRating(
            int productId) throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_AVERAGE_SQL)) {

            statement.setInt(1, productId);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return resultSet.getDouble("avg_rating");
                }
            }
        }

        return 0.0;
    }

    private ProductRating mapRow(ResultSet resultSet) throws SQLException {

        ProductRating rating = new ProductRating();

        rating.setRatingId(resultSet.getInt("rating_id"));

        rating.setProductId(resultSet.getInt("product_id"));

        rating.setUserId(resultSet.getInt("user_id"));

        rating.setRating(resultSet.getInt("rating"));

        rating.setReviewText(resultSet.getString("review_text"));

        Timestamp createdAt = resultSet.getTimestamp("created_at");

        if (createdAt != null) {

            rating.setCreatedAt(createdAt.toLocalDateTime());
        }

        return rating;
    }
}

