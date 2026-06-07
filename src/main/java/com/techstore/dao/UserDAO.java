package com.techstore.dao;

import com.techstore.model.User;
import com.techstore.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import java.util.ArrayList;
import java.util.List;

public class UserDAO {

    private static final String FIND_BY_ID_SQL = "SELECT * FROM users WHERE user_id = ?";

    private static final String FIND_BY_EMAIL_SQL = "SELECT * FROM users WHERE email = ?";

    private static final String INSERT_USER_SQL = "INSERT INTO users " +
            "(name, email, password_hash, role, phone, address) " +
            "VALUES (?, ?, ?, ?, ?, ?)";

    private static final String UPDATE_USER_SQL = "UPDATE users " +
            "SET name = ?, phone = ?, address = ? " +
            "WHERE user_id = ?";

    private static final String GET_ALL_USERS_SQL = "SELECT * FROM users ORDER BY created_at DESC";

    public User findById(int userId) throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(FIND_BY_ID_SQL)) {

            statement.setInt(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    public User findByEmail(String email) throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(FIND_BY_EMAIL_SQL)) {

            statement.setString(1, email);

            try (ResultSet resultSet = statement.executeQuery()) {

                if (resultSet.next()) {
                    return mapRow(resultSet);
                }
            }
        }

        return null;
    }

    public boolean createUser(User user) throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(INSERT_USER_SQL)) {

            statement.setString(1, user.getName());
            statement.setString(2, user.getEmail());
            statement.setString(3, user.getPasswordHash());
            statement.setString(4, user.getRole());
            statement.setString(5, user.getPhone());
            statement.setString(6, user.getAddress());

            return statement.executeUpdate() > 0;
        }
    }

    public boolean updateUser(User user) throws SQLException {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(UPDATE_USER_SQL)) {

            statement.setString(1, user.getName());
            statement.setString(2, user.getPhone());
            statement.setString(3, user.getAddress());
            statement.setInt(4, user.getUserId());

            return statement.executeUpdate() > 0;
        }
    }

    public List<User> getAllUsers() throws SQLException {

        List<User> users = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(GET_ALL_USERS_SQL);
                ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                users.add(mapRow(resultSet));
            }
        }

        return users;
    }

    private User mapRow(ResultSet resultSet) throws SQLException {

        User user = new User();

        user.setUserId(
                resultSet.getInt("user_id"));

        user.setName(
                resultSet.getString("name"));

        user.setEmail(
                resultSet.getString("email"));

        user.setPasswordHash(
                resultSet.getString("password_hash"));

        user.setRole(
                resultSet.getString("role"));

        user.setPhone(
                resultSet.getString("phone"));

        user.setAddress(
                resultSet.getString("address"));

        Timestamp createdAt = resultSet.getTimestamp("created_at");

        if (createdAt != null) {
            user.setCreatedAt(
                    createdAt.toLocalDateTime());
        }

        return user;
    }
}