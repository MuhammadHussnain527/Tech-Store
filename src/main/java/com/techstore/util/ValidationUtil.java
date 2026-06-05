package com.techstore.util;

import java.util.regex.Pattern;

public final class ValidationUtil {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern NAME_PATTERN = Pattern.compile(
            "^[A-Za-z ]{2,100}$");

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^[0-9+\\-() ]{7,20}$");

    private ValidationUtil() {
        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated.");
    }

    public static boolean isValidEmail(String email) {

        if (email == null || email.isBlank()) {
            return false;
        }

        return EMAIL_PATTERN
                .matcher(email.trim())
                .matches();
    }

    public static boolean isValidPassword(String password) {

        if (password == null) {
            return false;
        }

        return password.length() >= 8
                && password.length() <= 100;
    }

    public static boolean isValidName(String name) {

        if (name == null || name.isBlank()) {
            return false;
        }

        return NAME_PATTERN
                .matcher(name.trim())
                .matches();
    }

    public static boolean isValidPhone(String phone) {

        if (phone == null || phone.isBlank()) {
            return true;
        }

        return PHONE_PATTERN
                .matcher(phone.trim())
                .matches();
    }

    public static String sanitizeInput(String input) {

        if (input == null) {
            return null;
        }

        String sanitized = input.replaceAll(
                "<[^>]*>",
                "");

        return sanitized.trim();
    }
}