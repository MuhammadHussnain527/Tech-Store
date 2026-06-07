package com.techstore.servlet.admin;

import com.techstore.dao.OrderDAO;
import com.techstore.dao.ProductDAO;
import com.techstore.dao.UserDAO;
import com.techstore.util.JsonResponse;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/admin/dashboard")
public class AdminDashboardServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final ProductDAO productDAO = new ProductDAO();
    private final OrderDAO orderDAO = new OrderDAO();

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        try {

            Map<String, Object> dashboard = new LinkedHashMap<>();

            dashboard.put(
                    "totalUsers",
                    userDAO.getAllUsers().size());

            dashboard.put(
                    "totalProducts",
                    productDAO.getAllProducts().size());

            dashboard.put(
                    "totalOrders",
                    orderDAO.getAllOrders().size());

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