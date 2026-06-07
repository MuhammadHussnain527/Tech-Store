package com.techstore.servlet.auth;

import com.techstore.model.User;
import com.techstore.service.ServiceException;
import com.techstore.service.UserService;
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

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    private UserService userService;

    @Override
    public void init() throws ServletException {

        userService = new UserService();
    }

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            String email = request.getParameter("email");

            String password = request.getParameter("password");

            User user = userService.login(email, password);

            HttpSession oldSession = request.getSession(false);

            if (oldSession != null) {
                oldSession.invalidate();
            }

            HttpSession session = request.getSession(true);

            session.setMaxInactiveInterval(30 * 60);

            session.setAttribute("userId", user.getUserId());

            session.setAttribute("userRole", user.getRole());

            session.setAttribute("userName", user.getName());

            Map<String, Object> data = new LinkedHashMap<>();

            data.put("userId", user.getUserId());

            data.put("name", user.getName());

            data.put("email", user.getEmail());

            data.put("role", user.getRole());

            JsonResponse.sendSuccess(response, HttpServletResponse.SC_OK,
                    "Login successful", data);

        } catch (ServiceException e) {

            JsonResponse.sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    e.getMessage());

        } catch (Exception e) {

            JsonResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Login failed");
        }
    }
}