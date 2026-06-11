package com.techstore.controller;

import com.techstore.model.Order;
import com.techstore.service.OrderService;
import com.techstore.service.ServiceException;
import com.techstore.util.ResponseUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrders(@RequestParam(required = false) Integer id, HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
            }
            int userId = (Integer) session.getAttribute("userId");

            if (id != null) {
                Order order = orderService.getOrderById(id);
                if (order.getUserId() == null || !order.getUserId().equals(userId)) {
                    return ResponseUtil.error("Access denied", HttpStatus.FORBIDDEN);
                }
                return ResponseUtil.success("Order loaded", order, HttpStatus.OK);
            }

            List<Order> orders = orderService.getUserOrders(userId);
            return ResponseUtil.success("Orders loaded", orders, HttpStatus.OK);

        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Unable to load orders", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                return ResponseUtil.error("Authentication required", HttpStatus.UNAUTHORIZED);
            }
            int userId = (Integer) session.getAttribute("userId");

            Order order = new Order();
            order.setUserId(userId);
            order.setShippingName((String) body.get("shippingName"));
            order.setShippingAddress((String) body.get("shippingAddress"));
            order.setShippingPhone((String) body.get("shippingPhone"));

            String paymentMethod = (String) body.get("paymentMethod");
            if (paymentMethod != null) {
                paymentMethod = paymentMethod.trim().toUpperCase();
            }

            if (!java.util.Set.of(
                    "CREDIT_CARD", "PAYPAL", "BANK_TRANSFER", "CASH_ON_DELIVERY")
                    .contains(paymentMethod)) {
                throw new ServiceException(
                        "Invalid payment method. Allowed values: CREDIT_CARD, PAYPAL, BANK_TRANSFER, CASH_ON_DELIVERY");
            }

            order.setPaymentMethod(paymentMethod);

            if (order.getShippingName() == null || order.getShippingName().isBlank()) {
                throw new ServiceException("Shipping name is required");
            }

            if (order.getShippingAddress() == null || order.getShippingAddress().isBlank()) {
                throw new ServiceException("Shipping address is required");
            }

            int orderId = orderService.placeOrder(order);
            return ResponseUtil.success("Order placed successfully", orderId, HttpStatus.CREATED);

        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Unable to place order", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

