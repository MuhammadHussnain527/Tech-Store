package com.techstore.service;

import com.techstore.dao.CategoryDAO;
import com.techstore.model.Category;

import java.sql.SQLException;
import java.util.List;

public class CategoryService {

    private final CategoryDAO categoryDAO;

    public CategoryService() {
        this.categoryDAO = new CategoryDAO();
    }

    public List<Category> getAllCategories() throws ServiceException {
        try {
            return categoryDAO.getAllCategories();
        } catch (SQLException e) {
            throw new ServiceException("Unable to load categories", e);
        }
    }

    public Category getCategoryById(int categoryId) throws ServiceException {
        try {
            if (categoryId <= 0) {
                throw new ServiceException("Invalid category id");
            }
            Category category = categoryDAO.getCategoryById(categoryId);
            if (category == null) {
                throw new ServiceException("Category not found");
            }
            return category;
        } catch (SQLException e) {
            throw new ServiceException("Unable to load category", e);
        }
    }

    public Category getCategoryBySlug(String slug) throws ServiceException {
        try {
            slug = sanitize(slug);
            if (slug == null || slug.isBlank()) {
                throw new ServiceException("Invalid category slug");
            }
            Category category = categoryDAO.getCategoryBySlug(slug);
            if (category == null) {
                throw new ServiceException("Category not found");
            }
            return category;
        } catch (SQLException e) {
            throw new ServiceException("Unable to load category", e);
        }
    }

    public void createCategory(Category category) throws ServiceException {
        try {
            validateCategory(category);
            Category existing = categoryDAO.getCategoryBySlug(category.getSlug());
            if (existing != null) {
                throw new ServiceException("Category slug already exists");
            }
            boolean created = categoryDAO.createCategory(category);
            if (!created) {
                throw new ServiceException("Unable to create category");
            }
        } catch (SQLException e) {
            throw new ServiceException("Unable to create category", e);
        }
    }

    public void updateCategory(Category category) throws ServiceException {
        try {
            validateCategory(category);
            Category existing = categoryDAO.getCategoryById(category.getCategoryId());
            if (existing == null) {
                throw new ServiceException("Category not found");
            }
            Category slugOwner = categoryDAO.getCategoryBySlug(category.getSlug());
            if (slugOwner != null && slugOwner.getCategoryId() != category.getCategoryId()) {
                throw new ServiceException("Category slug already exists");
            }
            boolean updated = categoryDAO.updateCategory(category);
            if (!updated) {
                throw new ServiceException("Unable to update category");
            }
        } catch (SQLException e) {
            throw new ServiceException("Unable to update category", e);
        }
    }

    public void deleteCategory(int categoryId) throws ServiceException {
        try {
            if (categoryId <= 0) {
                throw new ServiceException("Invalid category id");
            }
            boolean deleted = categoryDAO.deleteCategory(categoryId);
            if (!deleted) {
                throw new ServiceException("Category not found");
            }
        } catch (SQLException e) {
            throw new ServiceException("Unable to delete category", e);
        }
    }

    private void validateCategory(Category category) throws ServiceException {
        if (category == null) {
            throw new ServiceException("Category is required");
        }
        if (category.getName() == null || category.getName().isBlank()) {
            throw new ServiceException("Category name is required");
        }
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            throw new ServiceException("Category slug is required");
        }
        category.setName(sanitize(category.getName()));
        category.setDescription(sanitize(category.getDescription()));
        category.setSlug(sanitize(category.getSlug()).toLowerCase());
    }

    private String sanitize(String value) {
        if (value == null) {
            return null;
        }
        return value.replaceAll("<[^>]*>", "").trim();
    }
}