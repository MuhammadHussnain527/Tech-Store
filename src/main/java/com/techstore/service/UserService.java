package com.techstore.service;

import com.techstore.repository.UserRepository;
import com.techstore.model.User;
import com.techstore.util.PasswordUtil;
import com.techstore.util.ValidationUtil;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.sql.SQLException;

@Service
public class UserService {

    @Autowired
    private UserRepository UserRepository;

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

            User existingUser = UserRepository.findByEmail(email);

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
            int generatedId = UserRepository.createUser(user);

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

            User user = UserRepository.findByEmail(email);

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

            User user = UserRepository.findById(userId);

            if (user == null) {
                throw new ServiceException("User not found");
            }

            user.setName(name);
            user.setPhone(phone);
            user.setAddress(address);

            boolean updated = UserRepository.updateUser(user);

            if (!updated) {
                throw new ServiceException("Profile update failed");
            }

        } catch (SQLException e) {

            throw new ServiceException("Profile update failed", e);
        }
    }

    public User getUserById(int userId) throws ServiceException {

        try {

            User user = UserRepository.findById(userId);

            if (user == null) {
                throw new ServiceException("User not found");
            }

            return user;

        } catch (SQLException e) {

            throw new ServiceException("Unable to load user", e);
        }
    }

    public int countAllUsers() throws ServiceException {
        try {
            return UserRepository.countAllUsers();
        } catch (SQLException e) {
            throw new ServiceException("Unable to count users", e);
        }
    }

    /**
     * Change password for an authenticated user (requires old password verification).
     */
    public void changePassword(int userId, String oldPassword, String newPassword) throws ServiceException {
        try {
            User user = UserRepository.findById(userId);
            if (user == null) {
                throw new ServiceException("User not found");
            }
            if (!PasswordUtil.verifyPassword(oldPassword, user.getPasswordHash())) {
                throw new ServiceException("Current password is incorrect");
            }
            if (newPassword == null || !ValidationUtil.isValidPassword(newPassword)) {
                throw new ServiceException(
                        "New password must be 8-100 characters and contain " +
                        "at least one uppercase letter, one lowercase letter, and one digit");
            }
            String newHash = PasswordUtil.hashPassword(newPassword);
            boolean updated = UserRepository.updatePasswordById(userId, newHash);
            if (!updated) {
                throw new ServiceException("Password update failed");
            }
        } catch (SQLException e) {
            throw new ServiceException("Password change failed", e);
        }
    }

    /**
     * Reset password without old-password check (forgot-password flow).
     * Verifies the email exists before resetting.
     */
    public void resetPassword(String email, String newPassword) throws ServiceException {
        try {
            email = ValidationUtil.sanitizeInput(email);
            if (email != null) email = email.toLowerCase();

            if (!ValidationUtil.isValidEmail(email)) {
                throw new ServiceException("Invalid email address");
            }
            if (!UserRepository.emailExists(email)) {
                // Do not reveal whether email is registered
                throw new ServiceException("If this email is registered, the password has been reset.");
            }
            if (newPassword == null || !ValidationUtil.isValidPassword(newPassword)) {
                throw new ServiceException(
                        "Password must be 8-100 characters and contain " +
                        "at least one uppercase letter, one lowercase letter, and one digit");
            }
            String newHash = PasswordUtil.hashPassword(newPassword);
            UserRepository.updatePasswordByEmail(email, newHash);
        } catch (SQLException e) {
            throw new ServiceException("Password reset failed", e);
        }
    }
}
