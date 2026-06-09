package com.techstore.dao;

import com.techstore.model.Product;
import com.techstore.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import java.util.ArrayList;
import java.util.List;

public class ProductDAO {

    private static final String GET_ALL_SQL = "SELECT * FROM products " +
            "WHERE is_active = 1 " +
            "ORDER BY created_at DESC";

    private static final String GET_ALL_INCLUDING_INACTIVE_SQL = "SELECT * FROM products " +
            "ORDER BY created_at DESC";

    private static final String GET_BY_ID_SQL = "SELECT * FROM products " +
            "WHERE product_id = ?";

    // Row-level lock for transactional checkout — prevents race condition / overselling
    private static final String GET_BY_ID_FOR_UPDATE_SQL = "SELECT * FROM products " +
            "WHERE product_id = ? FOR UPDATE";

    private static final String GET_BY_CATEGORY_SQL = "SELECT * FROM products " +
            "WHERE category_id = ? " +
            "AND is_active = 1 " +
            "ORDER BY created_at DESC";

    private static final String SEARCH_SQL = "SELECT * FROM products " +
            "WHERE is_active = 1 " +
            "AND (" +
            "LOWER(name) LIKE ? " +
            "OR LOWER(brand) LIKE ? " +
            "OR LOWER(description) LIKE ? " +
            "OR LOWER(specs) LIKE ?" +
            ")";

    private static final String INSERT_SQL = "INSERT INTO products " +
            "(category_id, name, description, brand, price, stock_qty, image_url, specs, is_active) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    private static final String UPDATE_SQL = "UPDATE products SET " +
            "category_id=?, " +
            "name=?, " +
            "description=?, " +
            "brand=?, " +
            "price=?, " +
            "stock_qty=?, " +
            "image_url=?, " +
            "specs=?, " +
            "is_active=? " +
            "WHERE product_id=?";

    // Atomic stock deduction: only succeeds if sufficient stock exists at the DB level
    private static final String DEDUCT_STOCK_SQL = "UPDATE products " +
            "SET stock_qty = stock_qty - ? " +
            "WHERE product_id = ? AND stock_qty >= ?";

    private static final String DELETE_SQL = "UPDATE products " +
            "SET is_active = 0 " +
            "WHERE product_id = ?";

    private static final String COUNT_ALL_SQL = "SELECT COUNT(*) AS total FROM products " +
            "WHERE is_active = 1";

    // ----------------------------------------------------------------
    // Public queries — use their own connection
    // ----------------------------------------------------------------

    public List<Product> getAllProducts()
            throws SQLException {

        List<Product> products = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_ALL_SQL);
                ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                products.add(mapRow(resultSet));
            }
        }

        return products;
    }

    public List<Product> getAllProductsIncludingInactive()
            throws SQLException {

        List<Product> products = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_ALL_INCLUDING_INACTIVE_SQL);
                ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                products.add(mapRow(resultSet));
            }
        }

        return products;
    }

    public Product getProductById(int productId)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_BY_ID_SQL)) {

            statement.setInt(1, productId);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    // ----------------------------------------------------------------
    // Transactional overloads — called with a shared connection
    // ----------------------------------------------------------------

    /**
     * Fetches a product and acquires a row-level exclusive lock (SELECT FOR UPDATE).
     * Must be called within an active transaction (autoCommit=false).
     * Prevents concurrent checkouts from reading stale stock values.
     */
    public Product getProductByIdForUpdate(Connection connection, int productId)
            throws SQLException {

        try (PreparedStatement statement = connection.prepareStatement(GET_BY_ID_FOR_UPDATE_SQL)) {

            statement.setInt(1, productId);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    /**
     * Atomically deducts stock within a transaction.
     * The WHERE clause (stock_qty >= quantity) ensures no deduction happens
     * if concurrent transactions have already reduced stock below the required amount.
     *
     * @return true if deduction succeeded, false if insufficient stock at DB level.
     */
    public boolean deductStock(Connection connection, int productId, int quantity)
            throws SQLException {

        try (PreparedStatement statement = connection.prepareStatement(DEDUCT_STOCK_SQL)) {

            statement.setInt(1, quantity);
            statement.setInt(2, productId);
            statement.setInt(3, quantity); // guard: stock_qty must be >= quantity

            return statement.executeUpdate() > 0;
        }
    }

    // ----------------------------------------------------------------
    // Remaining queries
    // ----------------------------------------------------------------

    public List<Product> getProductsByCategory(int categoryId)
            throws SQLException {

        List<Product> products = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_BY_CATEGORY_SQL)) {

            statement.setInt(1, categoryId);

            try (ResultSet resultSet = statement.executeQuery()) {

                while (resultSet.next()) {
                    products.add(mapRow(resultSet));
                }
            }
        }

        return products;
    }

    public List<Product> searchProducts(String keyword)
            throws SQLException {

        List<Product> products = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(SEARCH_SQL)) {

            String searchTerm = "%" + keyword.toLowerCase() + "%";

            statement.setString(1, searchTerm);
            statement.setString(2, searchTerm);
            statement.setString(3, searchTerm);
            statement.setString(4, searchTerm);

            try (ResultSet resultSet = statement.executeQuery()) {

                while (resultSet.next()) {
                    products.add(mapRow(resultSet));
                }
            }
        }

        return products;
    }

    public boolean addProduct(Product product)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {

            fillProductStatement(statement, product);

            return statement.executeUpdate() > 0;
        }
    }

    public boolean updateProduct(Product product)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(UPDATE_SQL)) {

            fillProductStatement(statement, product);

            statement.setInt(
                    10,
                    product.getProductId());

            return statement.executeUpdate() > 0;
        }
    }

    public boolean deleteProduct(int productId)
            throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(DELETE_SQL)) {

            statement.setInt(1, productId);

            return statement.executeUpdate() > 0;
        }
    }

    public int countAllProducts() throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(COUNT_ALL_SQL);
                ResultSet resultSet = statement.executeQuery()) {

            if (resultSet.next()) {
                return resultSet.getInt("total");
            }
        }

        return 0;
    }

    private void fillProductStatement(
            PreparedStatement statement,
            Product product)
            throws SQLException {

        statement.setInt(1, product.getCategoryId());
        statement.setString(2, product.getName());
        statement.setString(3, product.getDescription());
        statement.setString(4, product.getBrand());
        statement.setBigDecimal(5, product.getPrice());
        statement.setInt(6, product.getStockQty());
        statement.setString(7, product.getImageUrl());
        statement.setString(8, product.getSpecs());
        statement.setBoolean(9, product.isActive());
    }

    private Product mapRow(ResultSet resultSet)
            throws SQLException {

        Product product = new Product();

        product.setProductId(resultSet.getInt("product_id"));
        product.setCategoryId(resultSet.getInt("category_id"));
        product.setName(resultSet.getString("name"));
        product.setDescription(resultSet.getString("description"));
        product.setBrand(resultSet.getString("brand"));
        product.setPrice(resultSet.getBigDecimal("price"));
        product.setStockQty(resultSet.getInt("stock_qty"));
        product.setImageUrl(resultSet.getString("image_url"));
        product.setSpecs(resultSet.getString("specs"));
        product.setActive(resultSet.getBoolean("is_active"));

        Timestamp createdAt = resultSet.getTimestamp("created_at");

        if (createdAt != null) {
            product.setCreatedAt(createdAt.toLocalDateTime());
        }

        return product;
    }
}