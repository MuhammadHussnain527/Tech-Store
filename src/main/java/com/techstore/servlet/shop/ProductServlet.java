package com.techstore.servlet.shop;

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

@WebServlet("/products")
public class ProductServlet extends HttpServlet {

    private ProductService productService;

    @Override
    public void init() throws ServletException {

        productService = new ProductService();
    }

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            String productIdParam = request.getParameter("id");

            String categoryParam = request.getParameter("category");

            String searchParam = request.getParameter("search");

            /*
             * GET /products?id=1
             */
            if (productIdParam != null) {

                int productId = Integer.parseInt(productIdParam);

                Product product = productService.getProductById(productId);

                if (product == null) {

                    JsonResponse.sendError(
                            response,
                            HttpServletResponse.SC_NOT_FOUND,
                            "Product not found");

                    return;
                }

                JsonResponse.sendSuccess(
                        response,
                        HttpServletResponse.SC_OK,
                        "Product found",
                        product);

                return;
            }

            /*
             * GET /products?category=1
             */
            if (categoryParam != null) {

                int categoryId = Integer.parseInt(categoryParam);

                List<Product> products = productService.getProductsByCategory(categoryId);

                JsonResponse.sendSuccess(
                        response,
                        HttpServletResponse.SC_OK,
                        "Products loaded",
                        products);

                return;
            }

            /*
             * GET /products?search=laptop
             */
            if (searchParam != null &&
                    !searchParam.isBlank()) {

                List<Product> products = productService.searchProducts(searchParam);

                JsonResponse.sendSuccess(
                        response,
                        HttpServletResponse.SC_OK,
                        "Search completed",
                        products);

                return;
            }

            /*
             * GET /products
             */
            List<Product> products = productService.getAllProducts();

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Products loaded",
                    products);

        } catch (NumberFormatException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid product or category id");

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());
        }
    }
}