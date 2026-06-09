package com.techstore.service;

import com.techstore.dao.UserDAO;
import com.techstore.model.User;
import com.techstore.util.PasswordUtil;
import com.techstore.util.ValidationUtil;

import java.sql.SQLException;

public class UserService {

    private final UserDAO userDAO;

    public UserService() {
        this.userDAO = new UserDAO();
    }

    public User registerUser(
            String name,
            String email,
            String password,
            String phone,
            String address) throws ServiceException {

        try {

            name = ValidationUtil.sanitizeInput(name);
            email = ValidationUtil.sanitizeInput(email);
            phone = ValidationUtil.sanitizeInput(phone);
            address = ValidationUtil.sanitizeInput(address);

            if (email != null) {
                email = email.toLowerCase();
            }

            if (!ValidationUtil.isValidName(name)) {
                throw new ServiceException("Invalid name");
            }

            if (!ValidationUtil.isValidEmail(email)) {
                throw new ServiceException("Invalid email address");
            }

            if (password == null || !ValidationUtil.isValidPassword(password)) {
                throw new ServiceException(
                        "Password must be 8-100 characters and contain " +
                        "at least one uppercase letter, one lowercase letter, and one digit");
            }

            if (phone != null && !phone.isBlank() && !ValidationUtil.isValidPhone(phone)) {
                throw new ServiceException("Invalid phone number");
            }

            User existingUser = userDAO.findByEmail(email);

            if (existingUser != null) {
                throw new ServiceException("Email already registered");
            }

            String passwordHash = PasswordUtil.hashPassword(password);

            User user = new User();

            user.setName(name);
            user.setEmail(email);
            user.setPasswordHash(passwordHash);
            user.setRole("CUSTOMER");
            user.setPhone(phone);
            user.setAddress(address);

            // createUser() now returns the generated userId (> 0 on success)
            int generatedId = userDAO.createUser(user);

            if (generatedId <= 0) {
                throw new ServiceException("Unable to create account");
            }

            user.setUserId(generatedId);

            return user;

        } catch (SQLException e) {

            throw new ServiceException("Registration failed", e);
        }
    }

    public User login(String email, String password) throws ServiceException {

        try {

            email = ValidationUtil.sanitizeInput(email);

            if (email != null) {
                email = email.toLowerCase();
            }

            if (password == null) {
                throw new ServiceException("Invalid email or password");
            }

            User user = userDAO.findByEmail(email);

            if (user == null) {
                // Do NOT reveal whether the email exists
                throw new ServiceException("Invalid email or password");
            }

            boolean validPassword = PasswordUtil.verifyPassword(
                    password,
                    user.getPasswordHash());

            if (!validPassword) {
                throw new ServiceException("Invalid email or password");
            }

            return user;

        } catch (SQLException e) {

            throw new ServiceException("Login failed", e);
        }
    }

    public void updateProfile(
            int userId,
            String name,
            String phone,
            String address) throws ServiceException {

        try {

            name = ValidationUtil.sanitizeInput(name);
            phone = ValidationUtil.sanitizeInput(phone);
            address = ValidationUtil.sanitizeInput(address);

            if (!ValidationUtil.isValidName(name)) {
                throw new ServiceException("Invalid name");
            }

            if (phone != null && !phone.isBlank() && !ValidationUtil.isValidPhone(phone)) {
                throw new ServiceException("Invalid phone number");
            }

            User user = userDAO.findById(userId);

            if (user == null) {
                throw new ServiceException("User not found");
            }

            user.setName(name);
            user.setPhone(phone);
            user.setAddress(address);

            boolean updated = userDAO.updateUser(user);

            if (!updated) {
                throw new ServiceException("Profile update failed");
            }

        } catch (SQLException e) {

            throw new ServiceException("Profile update failed", e);
        }
    }

    public User getUserById(int userId) throws ServiceException {

        try {

            User user = userDAO.findById(userId);

            if (user == null) {
                throw new ServiceException("User not found");
            }

            return user;

        } catch (SQLException e) {

            throw new ServiceException("Unable to load user", e);
        }
    }
}