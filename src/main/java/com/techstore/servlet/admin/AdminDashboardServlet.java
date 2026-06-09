package com.techstore.servlet.admin;

import com.techstore.dao.OrderDAO;
import com.techstore.dao.ProductDAO;
import com.techstore.dao.UserDAO;
import com.techstore.util.JsonResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/admin/dashboard")
public class AdminDashboardServlet extends HttpServlet {

    private UserDAO userDAO;
    private ProductDAO productDAO;
    private OrderDAO orderDAO;

    @Override
    public void init() throws ServletException {

        userDAO = new UserDAO();
        productDAO = new ProductDAO();
        orderDAO = new OrderDAO();
    }

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        try {

            Map<String, Object> dashboard = new LinkedHashMap<>();

            // Use COUNT(*) queries — never load entire tables just to count them
            dashboard.put("totalUsers", userDAO.countAllUsers());

            dashboard.put("totalProducts", productDAO.countAllProducts());

            dashboard.put("totalOrders", orderDAO.countAllOrders());

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Dashboard data loaded",
                    dashboard);

        } catch (Exception e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Unable to load dashboard");
        }
    }
}