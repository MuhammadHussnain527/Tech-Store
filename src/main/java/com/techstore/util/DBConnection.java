package com.techstore.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DBConnection {

    private static final String URL;
    private static final String USERNAME;
    private static final String PASSWORD;
    private static final String DRIVER;

    static {

        Properties properties = new Properties();

        try (InputStream inputStream = DBConnection.class
                .getClassLoader()
                .getResourceAsStream("db.properties")) {

            if (inputStream == null) {
                throw new RuntimeException(
                        "db.properties file not found.");
            }

            properties.load(inputStream);

            URL = properties.getProperty("db.url");
            USERNAME = properties.getProperty("db.username");
            PASSWORD = properties.getProperty("db.password");
            DRIVER = properties.getProperty("db.driver");

            if (URL == null || URL.isBlank()) {
                throw new RuntimeException(
                        "db.url is missing.");
            }

            if (USERNAME == null) {
                throw new RuntimeException(
                        "db.username is missing.");
            }

            if (PASSWORD == null) {
                throw new RuntimeException(
                        "db.password is missing.");
            }

            if (DRIVER == null || DRIVER.isBlank()) {
                throw new RuntimeException(
                        "db.driver is missing.");
            }

            Class.forName(DRIVER);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to load database properties.",
                    e);

        } catch (ClassNotFoundException e) {

            throw new RuntimeException(
                    "Database driver not found.",
                    e);
        }
    }

    private DBConnection() {

        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated.");
    }

    public static Connection getConnection()
            throws SQLException {

        return DriverManager.getConnection(
                URL,
                USERNAME,
                PASSWORD);
    }
}