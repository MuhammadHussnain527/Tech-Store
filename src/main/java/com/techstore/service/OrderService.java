package com.techstore.service;

import com.techstore.dao.CartDAO;
import com.techstore.dao.OrderDAO;
import com.techstore.dao.OrderItemDAO;
import com.techstore.dao.ProductDAO;
import com.techstore.model.CartItem;
import com.techstore.model.Order;
import com.techstore.model.OrderItem;
import com.techstore.model.Product;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

public class OrderService {

    private final OrderDAO orderDAO;
    private final OrderItemDAO orderItemDAO;
    private final CartDAO cartDAO;
    private final ProductDAO productDAO;

    public OrderService() {
        this.orderDAO = new OrderDAO();
        this.orderItemDAO = new OrderItemDAO();
        this.cartDAO = new CartDAO();
        this.productDAO = new ProductDAO();
    }

    public int placeOrder(Order order)
            throws ServiceException {

        try {

            if (order == null) {
                throw new ServiceException("Order is required");
            }

            if (order.getUserId() == null || order.getUserId() <= 0) {
                throw new ServiceException("Invalid user");
            }

            List<CartItem> cartItems = cartDAO.getCartItems(order.getUserId());

            if (cartItems.isEmpty()) {
                throw new ServiceException("Cart is empty");
            }

            BigDecimal totalPrice = BigDecimal.ZERO;

            for (CartItem cartItem : cartItems) {

                Product product = productDAO.getProductById(
                        cartItem.getProductId());

                if (product == null) {
                    throw new ServiceException(
                            "Product not found: "
                                    + cartItem.getProductId());
                }

                if (!product.isActive()) {
                    throw new ServiceException(
                            "Product unavailable: "
                                    + product.getName());
                }

                if (cartItem.getQuantity() > product.getStockQty()) {

                    throw new ServiceException(
                            "Insufficient stock for "
                                    + product.getName());
                }

                BigDecimal itemTotal = product.getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        cartItem.getQuantity()));

                totalPrice = totalPrice.add(itemTotal);
            }

            order.setTotalPrice(totalPrice);

            if (order.getStatus() == null
                    || order.getStatus().isBlank()) {

                order.setStatus("PENDING");
            }

            int orderId = orderDAO.createOrder(order);

            if (orderId <= 0) {
                throw new ServiceException(
                        "Failed to create order");
            }

            for (CartItem cartItem : cartItems) {

                Product product = productDAO.getProductById(
                        cartItem.getProductId());

                OrderItem orderItem = new OrderItem();

                orderItem.setOrderId(orderId);
                orderItem.setProductId(
                        product.getProductId());

                orderItem.setProductName(
                        product.getName());

                orderItem.setQuantity(
                        cartItem.getQuantity());

                orderItem.setUnitPrice(
                        product.getPrice());

                orderItem.setSubtotal(
                        product.getPrice().multiply(
                                BigDecimal.valueOf(
                                        cartItem.getQuantity())));

                orderItemDAO.addOrderItem(
                        orderItem);

                product.setStockQty(
                        product.getStockQty()
                                - cartItem.getQuantity());

                productDAO.updateProduct(
                        product);
            }

            cartDAO.clearCart(
                    order.getUserId());

            return orderId;

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to place order",
                    e);
        }
    }

    public Order getOrderById(int orderId)
            throws ServiceException {

        try {

            Order order = orderDAO.getOrderById(orderId);

            if (order == null) {
                throw new ServiceException(
                        "Order not found");
            }

            return order;

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to load order",
                    e);
        }
    }

    public List<Order> getUserOrders(int userId)
            throws ServiceException {

        try {

            return orderDAO.getOrdersByUser(
                    userId);

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to load orders",
                    e);
        }
    }

    public List<Order> getAllOrders()
            throws ServiceException {

        try {

            return orderDAO.getAllOrders();

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to load orders",
                    e);
        }
    }

    public void updateOrderStatus(
            int orderId,
            String status)
            throws ServiceException {

        try {

            if (orderId <= 0) {
                throw new ServiceException(
                        "Invalid order id");
            }

            if (status == null
                    || status.isBlank()) {

                throw new ServiceException(
                        "Status is required");
            }

            boolean updated = orderDAO.updateOrderStatus(
                    orderId,
                    status);

            if (!updated) {

                throw new ServiceException(
                        "Order not found");
            }

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to update order",
                    e);
        }
    }
}