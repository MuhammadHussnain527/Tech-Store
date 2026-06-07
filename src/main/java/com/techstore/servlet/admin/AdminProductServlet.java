package com.techstore.servlet.admin;

import com.google.gson.Gson;
import com.techstore.model.Product;
import com.techstore.service.ProductService;
import com.techstore.service.ServiceException;
import com.techstore.util.JsonResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
// import java.math.BigDecimal;

@WebServlet("/admin/products")
public class AdminProductServlet extends HttpServlet {

    private final ProductService productService = new ProductService();

    private final Gson gson = new Gson();

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            Product product = gson.fromJson(
                    request.getReader(),
                    Product.class);

            productService.addProduct(product);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_CREATED,
                    "Product created successfully",
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

            Product product = gson.fromJson(
                    request.getReader(),
                    Product.class);

            productService.updateProduct(product);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Product updated successfully",
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

            String idParam = request.getParameter("id");

            int productId = Integer.parseInt(idParam);

            productService.deleteProduct(productId);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Product deleted successfully",
                    null);

        } catch (Exception e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid request");
        }
    }
}