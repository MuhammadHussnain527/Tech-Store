package com.techstore.servlet.auth;

import com.techstore.util.JsonResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/session")
public class SessionServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);

        if (session == null) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "No active session");

            return;
        }

        Object userId = session.getAttribute("userId");

        if (userId == null) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Not logged in");

            return;
        }

        Map<String, Object> data = new LinkedHashMap<>();

        data.put(
                "userId",
                session.getAttribute("userId"));

        data.put(
                "userName",
                session.getAttribute("userName"));

        data.put(
                "userRole",
                session.getAttribute("userRole"));

        JsonResponse.sendSuccess(
                response,
                HttpServletResponse.SC_OK,
                "Session active",
                data);
    }
}