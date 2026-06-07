package com.techstore.servlet.shop;

import com.techstore.model.Category;
import com.techstore.service.CategoryService;
import com.techstore.service.ServiceException;
import com.techstore.util.JsonResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/categories")
public class CategoryServlet extends HttpServlet {

    private CategoryService categoryService;

    @Override
    public void init() throws ServletException {

        categoryService = new CategoryService();
    }

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        try {

            String idParam = request.getParameter("id");

            String slugParam = request.getParameter("slug");

            /*
             * GET /categories?id=1
             */
            if (idParam != null) {

                int categoryId = Integer.parseInt(idParam);

                Category category = categoryService.getCategoryById(categoryId);

                if (category == null) {

                    JsonResponse.sendError(
                            response,
                            HttpServletResponse.SC_NOT_FOUND,
                            "Category not found");

                    return;
                }

                JsonResponse.sendSuccess(
                        response,
                        HttpServletResponse.SC_OK,
                        "Category found",
                        category);

                return;
            }

            /*
             * GET /categories?slug=laptops
             */
            if (slugParam != null &&
                    !slugParam.isBlank()) {

                Category category = categoryService.getCategoryBySlug(slugParam);

                if (category == null) {

                    JsonResponse.sendError(
                            response,
                            HttpServletResponse.SC_NOT_FOUND,
                            "Category not found");

                    return;
                }

                JsonResponse.sendSuccess(
                        response,
                        HttpServletResponse.SC_OK,
                        "Category found",
                        category);

                return;
            }

            /*
             * GET /categories
             */
            List<Category> categories = categoryService.getAllCategories();

            JsonResponse.sendSuccess(
                    response,
                    HttpServletResponse.SC_OK,
                    "Categories loaded",
                    categories);

        } catch (NumberFormatException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid category id");

        } catch (ServiceException e) {

            JsonResponse.sendError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    e.getMessage());
        }
    }
}