package com.techstore.util;

import org.mindrot.jbcrypt.BCrypt;

public final class PasswordUtil {

    private static final int WORK_FACTOR = 12;

    private PasswordUtil() {
        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated.");
    }

    public static String hashPassword(String plainPassword) {

        if (plainPassword == null || plainPassword.isBlank()) {

            throw new IllegalArgumentException(
                    "Password cannot be null or empty.");
        }

        return BCrypt.hashpw(
                plainPassword,
                BCrypt.gensalt(WORK_FACTOR));
    }

    public static boolean verifyPassword(
            String plainPassword,
            String hashedPassword) {

        if (plainPassword == null ||
                hashedPassword == null ||
                hashedPassword.isBlank()) {

            return false;
        }

        try {

            return BCrypt.checkpw(
                    plainPassword,
                    hashedPassword);

        } catch (IllegalArgumentException e) {

            return false;
        }
    }
}
