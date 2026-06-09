package com.techstore.service;

import com.techstore.dao.CartDAO;
import com.techstore.dao.OrderDAO;
import com.techstore.dao.OrderItemDAO;
import com.techstore.dao.ProductDAO;
import com.techstore.model.CartItem;
import com.techstore.model.Order;
import com.techstore.model.OrderItem;
import com.techstore.model.Product;
import com.techstore.util.DBConnection;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class OrderService {

    // Allowed order statuses — enforced in updateOrderStatus()
    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");

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

    /**
     * Places an order within a single JDBC transaction.
     *
     * Flow:
     * 1. Validate order fields (pre-transaction)
     * 2. Load cart items (pre-transaction)
     * 3. BEGIN TRANSACTION
     * 4. FOR each cart item:
     *    a. SELECT ... FOR UPDATE  (locks row — prevents race condition)
     *    b. Validate product active + stock
     *    c. Build OrderItem
     * 5. Compute server-side total price
     * 6. INSERT order record
     * 7. FOR each OrderItem: INSERT + atomically deduct stock
     * 8. DELETE cart items
     * 9. COMMIT — all or nothing
     */
    public int placeOrder(Order order) throws ServiceException {

        if (order == null) {
            throw new ServiceException("Order is required");
        }

        if (order.getUserId() == null || order.getUserId() <= 0) {
            throw new ServiceException("Invalid user");
        }

        // Always force PENDING — never accept a status from the client
        order.setStatus("PENDING");

        try {

            List<CartItem> cartItems = cartDAO.getCartItems(order.getUserId());

            if (cartItems.isEmpty()) {
                throw new ServiceException("Cart is empty");
            }

            try (Connection connection = DBConnection.getConnection()) {

                connection.setAutoCommit(false);

                try {

                    // Phase 1: Lock all product rows and validate stock
                    List<OrderItem> orderItems = new ArrayList<>();
                    BigDecimal totalPrice = BigDecimal.ZERO;

                    for (CartItem cartItem : cartItems) {

                        // SELECT ... FOR UPDATE prevents concurrent reads from
                        // seeing stale stock and double-committing the same units
                        Product product = productDAO.getProductByIdForUpdate(
                                connection,
                                cartItem.getProductId());

                        if (product == null) {
                            throw new ServiceException(
                                    "Product not found: " + cartItem.getProductId());
                        }

                        if (!product.isActive()) {
                            throw new ServiceException(
                                    "Product is no longer available: " + product.getName());
                        }

                        if (cartItem.getQuantity() > product.getStockQty()) {
                            throw new ServiceException(
                                    "Insufficient stock for \"" + product.getName() + "\". " +
                                    "Available: " + product.getStockQty() + ", " +
                                    "Requested: " + cartItem.getQuantity());
                        }

                        BigDecimal itemTotal = product.getPrice()
                                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

                        totalPrice = totalPrice.add(itemTotal);

                        OrderItem orderItem = new OrderItem();
                        orderItem.setProductId(product.getProductId());
                        orderItem.setProductName(product.getName());
                        orderItem.setQuantity(cartItem.getQuantity());
                        orderItem.setUnitPrice(product.getPrice()); // snapshot price at time of order
                        orderItem.setSubtotal(itemTotal);

                        orderItems.add(orderItem);
                    }

                    // Phase 2: Set server-computed total
                    order.setTotalPrice(totalPrice);

                    // Phase 3: Persist order header
                    int orderId = orderDAO.createOrder(connection, order);

                    if (orderId <= 0) {
                        throw new ServiceException("Failed to create order record");
                    }

                    // Phase 4: Persist each order item and atomically deduct stock
                    for (OrderItem orderItem : orderItems) {

                        orderItem.setOrderId(orderId);

                        orderItemDAO.addOrderItem(connection, orderItem);

                        boolean deducted = productDAO.deductStock(
                                connection,
                                orderItem.getProductId(),
                                orderItem.getQuantity());

                        if (!deducted) {
                            // Another concurrent transaction already took the last units
                            throw new ServiceException(
                                    "Stock no longer available for: " + orderItem.getProductName());
                        }
                    }

                    // Phase 5: Clear the cart
                    cartDAO.clearCart(connection, order.getUserId());

                    // All operations succeeded — commit
                    connection.commit();

                    return orderId;

                } catch (ServiceException e) {

                    connection.rollback();

                    throw e;

                } catch (Exception e) {

                    connection.rollback();

                    throw new ServiceException("Unable to place order", e);
                }
            }

        } catch (ServiceException e) {
            throw e;
        } catch (SQLException e) {
            throw new ServiceException("Unable to place order", e);
        }
    }

    public Order getOrderById(int orderId)
            throws ServiceException {

        try {

            Order order = orderDAO.getOrderById(orderId);

            if (order == null) {
                throw new ServiceException("Order not found");
            }

            return order;

        } catch (SQLException e) {

            throw new ServiceException("Unable to load order", e);
        }
    }

    public List<Order> getUserOrders(int userId)
            throws ServiceException {

        try {

            return orderDAO.getOrdersByUser(userId);

        } catch (SQLException e) {

            throw new ServiceException("Unable to load orders", e);
        }
    }

    public List<Order> getAllOrders()
            throws ServiceException {

        try {

            return orderDAO.getAllOrders();

        } catch (SQLException e) {

            throw new ServiceException("Unable to load orders", e);
        }
    }

    public void updateOrderStatus(
            int orderId,
            String status)
            throws ServiceException {

        try {

            if (orderId <= 0) {
                throw new ServiceException("Invalid order id");
            }

            if (status == null || status.isBlank()) {
                throw new ServiceException("Status is required");
            }

            String normalizedStatus = status.trim().toUpperCase();

            if (!VALID_STATUSES.contains(normalizedStatus)) {
                throw new ServiceException(
                        "Invalid status. Allowed values: " +
                        String.join(", ", VALID_STATUSES));
            }

            boolean updated = orderDAO.updateOrderStatus(orderId, normalizedStatus);

            if (!updated) {
                throw new ServiceException("Order not found");
            }

        } catch (SQLException e) {

            throw new ServiceException("Unable to update order", e);
        }
    }
}