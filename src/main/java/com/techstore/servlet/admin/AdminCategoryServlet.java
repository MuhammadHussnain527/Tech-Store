package com.techstore.servlet.admin;

import com.google.gson.Gson;
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

@WebServlet("/admin/categories")
public class AdminCategoryServlet extends HttpServlet {

    private final CategoryService categoryService = new CategoryService();

    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String categoryIdParam = request.getParameter("id");

            if (categoryIdParam != null && !categoryIdParam.isBlank()) {
                int categoryId = Integer.parseInt(categoryIdParam);
                Category category = categoryService.getCategoryById(categoryId);
                JsonResponse.sendSuccess(response, HttpServletResponse.SC_OK, "Category loaded", category);
                return;
            }

            List<Category> categories = categoryService.getAllCategories();
            JsonResponse.sendSuccess(response, HttpServletResponse.SC_OK, "Categories loaded", categories);

        } catch (NumberFormatException e) {
            JsonResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid category id");
        } catch (ServiceException e) {
            JsonResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Category category = gson.fromJson(request.getReader(), Category.class);
            categoryService.createCategory(category);
            JsonResponse.sendSuccess(response, HttpServletResponse.SC_CREATED, "Category created", null);
        } catch (ServiceException e) {
            JsonResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Category category = gson.fromJson(request.getReader(), Category.class);
            categoryService.updateCategory(category);
            JsonResponse.sendSuccess(response, HttpServletResponse.SC_OK, "Category updated", null);
        } catch (ServiceException e) {
            JsonResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String categoryIdParam = request.getParameter("id");

            if (categoryIdParam == null || categoryIdParam.isBlank()) {
                JsonResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Category id required");
                return;
            }

            int categoryId = Integer.parseInt(categoryIdParam);
            categoryService.deleteCategory(categoryId);
            JsonResponse.sendSuccess(response, HttpServletResponse.SC_OK, "Category deleted", null);

        } catch (NumberFormatException e) {
            JsonResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid category id");
        } catch (ServiceException e) {
            JsonResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }
}