package com.techstore.servlet.admin;

import com.techstore.model.Order;
import com.techstore.service.OrderService;
import com.techstore.service.ServiceException;
import com.techstore.util.JsonResponse;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/admin/orders")
public class AdminOrderServlet extends HttpServlet {

    private final OrderService orderService = new OrderService();

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        try {

            List<Order> orders = orderService.getAllOrders();

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Orders loaded successfully",
                    orders);

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }

    @Override
    protected void doPut(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        try {

            int orderId = Integer.parseInt(
                    request.getParameter("orderId"));

            String status = request.getParameter("status");

            orderService.updateOrderStatus(
                    orderId,
                    status);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Order status updated",
                    null);

        } catch (Exception e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());
        }
    }
}