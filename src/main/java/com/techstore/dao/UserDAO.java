package com.techstore.dao;

import com.techstore.model.User;
import com.techstore.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

/**
 * Data Access Object for {@link User} entity.
 *
 * <p>All database operations are performed via {@link PreparedStatement} to
 * prevent SQL injection. Connections are managed exclusively through
 * try-with-resources to guarantee no leaks. This class holds no instance or
 * static mutable state and is therefore safe for concurrent use.
 *
 * <p>Responsibilities of this class:
 * <ul>
 *   <li>Persist new user records</li>
 *   <li>Retrieve user records by email or ID</li>
 *   <li>Map database rows to {@link User} model objects</li>
 * </ul>
 *
 * <p>Responsibilities explicitly <strong>outside</strong> this class:
 * <ul>
 *   <li>Password hashing (must be done before calling {@link #createUser})</li>
 *   <li>Business-level input validation beyond null / format guards</li>
 *   <li>Authentication logic</li>
 * </ul>
 */
public class UserDAO {

    private static final Logger LOGGER = Logger.getLogger(UserDAO.class.getName());

    /** Basic RFC-5322-subset pattern — rejects obviously malformed addresses. */
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private static final String DEFAULT_ROLE = "CUSTOMER";
    private static final String SQLSTATE_DUPLICATE_ENTRY = "23000";

    // ------------------------------------------------------------------
    // SQL Constants
    // ------------------------------------------------------------------

    private static final String SQL_INSERT_USER =
            "INSERT INTO users (name, email, password_hash, role, phone, address) "
            + "VALUES (?, ?, ?, ?, ?, ?)";

    private static final String SQL_SELECT_BY_EMAIL =
            "SELECT user_id, name, email, password_hash, role, phone, address, created_at "
            + "FROM users WHERE email = ?";

    private static final String SQL_SELECT_BY_ID =
            "SELECT user_id, name, email, password_hash, role, phone, address, created_at "
            + "FROM users WHERE user_id = ?";

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    /**
     * Persists a new user record to the {@code users} table.
     *
     * <ul>
     *   <li>If {@code user.getRole()} is {@code null} or blank, the role
     *       defaults to {@code "CUSTOMER"}.</li>
     *   <li>The {@code password_hash} field must already contain a hashed
     *       value; this method stores it verbatim.</li>
     * </ul>
     *
     * @param user a fully populated {@link User} object; must not be {@code null}
     * @return {@code true} if exactly one row was inserted, {@code false} otherwise
     * @throws IllegalArgumentException if {@code user} is {@code null}, its email
     *                                  is malformed, or required fields are blank
     * @throws RuntimeException         wrapping the underlying {@link SQLException},
     *                                  or with message {@code "Email already exists"}
     *                                  when the email violates the unique constraint
     */
    public boolean createUser(User user) {
        validateUserNotNull(user);
        validateEmail(user.getEmail());

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("Password hash must not be null or blank");
        }

        String role = resolveRole(user.getRole());

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_INSERT_USER)) {

            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail().trim());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, role);
            ps.setString(5, user.getPhone());
            ps.setString(6, user.getAddress());

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            if (SQLSTATE_DUPLICATE_ENTRY.equals(e.getSQLState())) {
                throw new RuntimeException("Email already exists");
            }
            LOGGER.log(Level.SEVERE, "[UserDAO] createUser failed — SQLState: {0}", e.getSQLState());
            throw new RuntimeException("Unable to create user due to a database error", e);
        }
    }

    /**
     * Retrieves a user by email address.
     *
     * <p>The email is trimmed before the query is executed. The returned
     * object includes the {@code passwordHash} field; callers must not
     * expose this value externally.
     *
     * @param email the email address to look up; must not be {@code null} or blank
     * @return the matching {@link User}, or {@code null} if no record exists
     * @throws IllegalArgumentException if {@code email} is {@code null}, blank,
     *                                  or does not match the expected format
     * @throws RuntimeException         wrapping the underlying {@link SQLException}
     */
    public User getUserByEmail(String email) {
        validateEmail(email);

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_SELECT_BY_EMAIL)) {

            ps.setString(1, email.trim());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "[UserDAO] getUserByEmail failed — SQLState: {0}", e.getSQLState());
            throw new RuntimeException("Unable to retrieve user by email due to a database error", e);
        }

        return null;
    }

    /**
     * Retrieves a user by their primary key.
     *
     * @param userId the unique identifier of the user; must be a positive integer
     * @return the matching {@link User}, or {@code null} if no record exists
     * @throws IllegalArgumentException if {@code userId} is not positive
     * @throws RuntimeException         wrapping the underlying {@link SQLException}
     */
    public User getUserById(int userId) {
        if (userId <= 0) {
            throw new IllegalArgumentException("userId must be a positive integer, got: " + userId);
        }

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_SELECT_BY_ID)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "[UserDAO] getUserById failed — SQLState: {0}", e.getSQLState());
            throw new RuntimeException("Unable to retrieve user by ID due to a database error", e);
        }

        return null;
    }

    // ------------------------------------------------------------------
    // Private Helpers
    // ------------------------------------------------------------------

    /**
     * Maps all columns of the current {@link ResultSet} row to a {@link User} object.
     *
     * @param rs an open {@link ResultSet} positioned at a valid row
     * @return a fully populated {@link User} object
     * @throws SQLException if any column label is invalid or the ResultSet is closed
     */
    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();

        user.setUserId(rs.getInt("user_id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setRole(rs.getString("role"));
        user.setPhone(rs.getString("phone"));
        user.setAddress(rs.getString("address"));
        user.setCreatedAt(rs.getTimestamp("created_at"));

        return user;
    }

    /**
     * Validates that {@code user} is not {@code null}.
     *
     * @param user the object to check
     * @throws IllegalArgumentException if {@code user} is {@code null}
     */
    private void validateUserNotNull(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User must not be null");
        }
    }

    /**
     * Validates that {@code email} is non-null, non-blank, and matches the
     * expected email format.
     *
     * @param email the email address to validate
     * @throws IllegalArgumentException if any check fails
     */
    private void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email must not be null or blank");
        }
        if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Email format is invalid");
        }
    }

    /**
     * Returns the provided role if non-null and non-blank, otherwise falls
     * back to {@link #DEFAULT_ROLE}.
     *
     * @param role the role value from the {@link User} object
     * @return a guaranteed non-null, non-blank role string
     */
    private String resolveRole(String role) {
        return (role == null || role.isBlank()) ? DEFAULT_ROLE : role;
    }
}
