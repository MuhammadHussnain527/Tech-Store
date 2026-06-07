package com.techstore.servlet.shop;

import com.google.gson.Gson;
import com.techstore.model.Order;
import com.techstore.service.OrderService;
import com.techstore.service.ServiceException;
import com.techstore.util.JsonResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/orders")
public class OrderServlet extends HttpServlet {

        private final Gson gson = new Gson();

        private OrderService orderService;

        @Override
        public void init() throws ServletException {

                orderService = new OrderService();
        }

        @Override
        protected void doGet(HttpServletRequest request, HttpServletResponse response)
                        throws ServletException, IOException {

                try {

                        HttpSession session = request.getSession(false);

                        if (session == null || session.getAttribute("userId") == null) {

                                JsonResponse.sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                                                "Authentication required");
                                return;
                        }

                        int userId = (Integer) session.getAttribute("userId");

                        String orderIdParam = request.getParameter("id");

                        if (orderIdParam != null && !orderIdParam.isBlank()) {

                                int orderId = Integer.parseInt(orderIdParam);

                                Order order = orderService.getOrderById(orderId);

                                if (order.getUserId() == null ||
                                                !order.getUserId().equals(userId)) {

                                        JsonResponse.sendError(response, HttpServletResponse.SC_FORBIDDEN,
                                                        "Access denied");

                                        return;
                                }

                                JsonResponse.sendSuccess(response, HttpServletResponse.SC_OK, "Order loaded", order);

                                return;
                        }

                        List<Order> orders = orderService.getUserOrders(userId);

                        JsonResponse.sendSuccess(
                                        response,
                                        HttpServletResponse.SC_OK,
                                        "Orders loaded",
                                        orders);

                } catch (NumberFormatException e) {

                        JsonResponse.sendError(
                                        response,
                                        HttpServletResponse.SC_BAD_REQUEST,
                                        "Invalid order id");

                } catch (ServiceException e) {

                        JsonResponse.sendError(
                                        response,
                                        HttpServletResponse.SC_BAD_REQUEST,
                                        e.getMessage());

                } catch (Exception e) {

                        JsonResponse.sendError(
                                        response,
                                        HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                                        "Unable to load orders");
                }
        }

        @Override
        protected void doPost(
                        HttpServletRequest request,
                        HttpServletResponse response)
                        throws ServletException, IOException {

                try {

                        HttpSession session = request.getSession(false);

                        if (session == null ||
                                        session.getAttribute("userId") == null) {

                                JsonResponse.sendError(
                                                response,
                                                HttpServletResponse.SC_UNAUTHORIZED,
                                                "Authentication required");

                                return;
                        }

                        int userId = (Integer) session.getAttribute("userId");

                        @SuppressWarnings("unchecked")
                        Map<String, Object> body = gson.fromJson(
                                        request.getReader(),
                                        Map.class);

                        if (body == null) {

                                throw new ServiceException(
                                                "Request body is required");
                        }

                        Order order = new Order();

                        order.setUserId(userId);

                        order.setShippingName((String) body.get("shippingName"));

                        order.setShippingAddress((String) body.get("shippingAddress"));

                        order.setShippingPhone((String) body.get("shippingPhone"));

                        order.setPaymentMethod((String) body.get("paymentMethod"));

                        if (order.getShippingName() == null ||
                                        order.getShippingName().isBlank()) {

                                throw new ServiceException("Shipping name is required");
                        }

                        if (order.getShippingAddress() == null ||
                                        order.getShippingAddress().isBlank()) {

                                throw new ServiceException("Shipping address is required");
                        }

                        int orderId = orderService.placeOrder(order);

                        JsonResponse.sendSuccess(
                                        response,
                                        HttpServletResponse.SC_CREATED,
                                        "Order placed successfully",
                                        orderId);

                } catch (ServiceException e) {

                        JsonResponse.sendError(
                                        response,
                                        HttpServletResponse.SC_BAD_REQUEST,
                                        e.getMessage());

                } catch (Exception e) {

                        JsonResponse.sendError(
                                        response,
                                        HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                                        "Unable to place order");
                }
        }
}