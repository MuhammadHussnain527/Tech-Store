package com.techstore.servlet.admin;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
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
import java.util.List;

@WebServlet("/admin/products")
public class AdminProductServlet extends HttpServlet {

    private ProductService productService;

    private final Gson gson = new Gson();

    @Override
    public void init() throws ServletException {

        productService = new ProductService();
    }

    /**
     * GET /admin/products        — list all products (including inactive)
     * GET /admin/products?id=1   — get single product by id
     */
    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            String idParam = request.getParameter("id");

            if (idParam != null) {

                int productId = Integer.parseInt(idParam);

                Product product = productService.getProductById(productId);

                JsonResponse.sendSuccess(
                        response,
                        HttpServletResponse.SC_OK,
                        "Product loaded",
                        product);

                return;
            }

            // Admin sees all products including inactive (soft-deleted)
            List<Product> products = productService.getAllProductsIncludingInactive();

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Products loaded",
                    products);

        } catch (NumberFormatException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid product id");

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

            Product product = gson.fromJson(
                    request.getReader(),
                    Product.class);

            productService.addProduct(product);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_CREATED,
                    "Product created successfully",
                    null);

        } catch (JsonSyntaxException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid JSON in request body");

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());

        } catch (Exception e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Unable to create product");
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

        } catch (JsonSyntaxException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid JSON in request body");

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());

        } catch (Exception e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Unable to update product");
        }
    }

    @Override
    protected void doDelete(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            String idParam = request.getParameter("id");

            if (idParam == null || idParam.isBlank()) {

                JsonResponse.sendError(
                        response,
                        HttpServletResponse.SC_BAD_REQUEST,
                        "Product id is required");

                return;
            }

            int productId = Integer.parseInt(idParam);

            productService.deleteProduct(productId);

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Product deleted successfully",
                    null);

        } catch (NumberFormatException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid product id");

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());
        }
    }
}