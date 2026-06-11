package com.techstore.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ResponseUtil {

    private ResponseUtil() {
    }

    public static ResponseEntity<Map<String, Object>> success(String message, Object data, HttpStatus status) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("message", message);
        if (data != null) {
            result.put("data", data);
        }
        return new ResponseEntity<>(result, status);
    }

    public static ResponseEntity<Map<String, Object>> error(String message, HttpStatus status) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", false);
        result.put("message", message);
        return new ResponseEntity<>(result, status);
    }
}

