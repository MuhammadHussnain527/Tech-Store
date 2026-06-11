package com.techstore.repository;

import com.techstore.model.Category;
import org.springframework.stereotype.Repository;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.util.ArrayList;
import java.util.List;

@Repository
public class CategoryRepository {

    @Autowired
    private DataSource dataSource;

    private static final String GET_ALL_SQL = "SELECT * FROM categories ORDER BY name";

    private static final String GET_BY_ID_SQL = "SELECT * FROM categories WHERE category_id = ?";

    private static final String GET_BY_SLUG_SQL = "SELECT * FROM categories WHERE slug = ?";

    private static final String INSERT_SQL = "INSERT INTO categories (name, description, slug) " +
            "VALUES (?, ?, ?)";

    private static final String UPDATE_SQL = "UPDATE categories " +
            "SET name = ?, description = ?, slug = ? " +
            "WHERE category_id = ?";

    private static final String DELETE_SQL = "DELETE FROM categories WHERE category_id = ?";

    public List<Category> getAllCategories() throws SQLException {

        List<Category> categories = new ArrayList<>();

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_ALL_SQL);
                ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                categories.add(mapRow(resultSet));
            }
        }

        return categories;
    }

    public Category getCategoryById(int categoryId)
            throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_BY_ID_SQL)) {

            statement.setInt(1, categoryId);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    public Category getCategoryBySlug(String slug)
            throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_BY_SLUG_SQL)) {

            statement.setString(1, slug);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    public boolean createCategory(Category category)
            throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {

            statement.setString(1, category.getName());
            statement.setString(2, category.getDescription());
            statement.setString(3, category.getSlug());

            return statement.executeUpdate() > 0;
        }
    }

    public boolean updateCategory(Category category)
            throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(UPDATE_SQL)) {

            statement.setString(1, category.getName());
            statement.setString(2, category.getDescription());
            statement.setString(3, category.getSlug());
            statement.setInt(4, category.getCategoryId());

            return statement.executeUpdate() > 0;
        }
    }

    public boolean deleteCategory(int categoryId)
            throws SQLException {

        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(DELETE_SQL)) {

            statement.setInt(1, categoryId);

            return statement.executeUpdate() > 0;
        }
    }

    private Category mapRow(ResultSet resultSet)
            throws SQLException {

        Category category = new Category();

        category.setCategoryId(
                resultSet.getInt("category_id"));

        category.setName(
                resultSet.getString("name"));

        category.setDescription(
                resultSet.getString("description"));

        category.setSlug(
                resultSet.getString("slug"));

        return category;
    }
}

