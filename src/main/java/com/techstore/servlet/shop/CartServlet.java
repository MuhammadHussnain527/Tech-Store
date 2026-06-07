package com.techstore.servlet.shop;

import com.google.gson.Gson;
import com.techstore.model.CartItem;
import com.techstore.service.CartService;
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

@WebServlet("/cart")
public class CartServlet extends HttpServlet {

    private final Gson gson = new Gson();

    private CartService cartService;

    @Override
    public void init() throws ServletException {

        cartService = new CartService();
    }

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            HttpSession session = request.getSession(false);

            int userId = (Integer) session.getAttribute("userId");

            List<CartItem> items = cartService.getCartItems(userId);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Cart loaded",
                    items);

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());
        }
    }

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            HttpSession session = request.getSession(false);

            int userId = (Integer) session.getAttribute("userId");

            @SuppressWarnings("unchecked")
            Map<String, Object> body = gson.fromJson(
                    request.getReader(),
                    Map.class);

            int productId = ((Double) body.get("productId")).intValue();

            int quantity = ((Double) body.get("quantity")).intValue();

            cartService.addToCart(
                    userId,
                    productId,
                    quantity);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Item added to cart",
                    null);

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());
        }
    }

    @Override
    protected void doPut(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            HttpSession session = request.getSession(false);

            int userId = (Integer) session.getAttribute("userId");

            @SuppressWarnings("unchecked")
            Map<String, Object> body = gson.fromJson(
                    request.getReader(),
                    Map.class);

            int productId = ((Double) body.get("productId")).intValue();

            int quantity = ((Double) body.get("quantity")).intValue();

            cartService.updateQuantity(
                    userId,
                    productId,
                    quantity);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Cart updated",
                    null);

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());
        }
    }

    @Override
    protected void doDelete(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            HttpSession session = request.getSession(false);

            int userId = (Integer) session.getAttribute("userId");

            String productIdParam = request.getParameter("productId");

            if (productIdParam == null) {

                cartService.clearCart(userId);

                JsonResponse.sendSuccess(
                        response,
                        HttpServletResponse.SC_OK,
                        "Cart cleared",
                        null);

                return;
            }

            int productId = Integer.parseInt(productIdParam);

            cartService.removeItem(
                    userId,
                    productId);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Item removed",
                    null);

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());
        }
    }
}