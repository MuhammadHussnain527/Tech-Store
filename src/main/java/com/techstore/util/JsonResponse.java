package com.techstore.util;

import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

public final class JsonResponse {

    private static final Gson GSON = new Gson();

    private JsonResponse() {
        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated.");
    }

    public static void sendSuccess(
            HttpServletResponse response,
            int statusCode,
            String message,
            Object data) throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("success", true);
        result.put("message", message);
        result.put("data", data);

        response.getWriter().write(
                GSON.toJson(result));
    }

    public static void sendError(
            HttpServletResponse response,
            int statusCode,
            String message) throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("success", false);
        result.put("message", message);

        response.getWriter().write(
                GSON.toJson(result));
    }
}