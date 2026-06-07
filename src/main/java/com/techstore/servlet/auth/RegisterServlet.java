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

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/register")
public class RegisterServlet extends HttpServlet {

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

            String name = request.getParameter("name");

            String email = request.getParameter("email");

            String password = request.getParameter("password");

            String phone = request.getParameter("phone");

            String address = request.getParameter("address");

            User user = userService.registerUser(name, email, password, phone, address);

            Map<String, Object> data = new LinkedHashMap<>();

            data.put("userId", user.getUserId());

            data.put("name", user.getName());

            data.put("email", user.getEmail());

            data.put("role", user.getRole());

            JsonResponse.sendSuccess(response, HttpServletResponse.SC_CREATED,
                    "Registration successful", data);

        } catch (ServiceException e) {

            JsonResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());

        } catch (Exception e) {

            JsonResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Registration failed");
        }
    }
}