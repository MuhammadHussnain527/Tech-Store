package com.techstore.service;

import com.techstore.repository.CategoryRepository;
import com.techstore.model.Category;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.techstore.util.ValidationUtil;

import java.sql.SQLException;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository CategoryRepository;

    public List<Category> getAllCategories() throws ServiceException {
        try {
            return CategoryRepository.getAllCategories();
        } catch (SQLException e) {
            throw new ServiceException("Unable to load categories", e);
        }
    }

    public Category getCategoryById(int categoryId) throws ServiceException {
        try {
            if (categoryId <= 0) {
                throw new ServiceException("Invalid category id");
            }
            Category category = CategoryRepository.getCategoryById(categoryId);
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
            slug = ValidationUtil.sanitizeInput(slug);
            if (slug == null || slug.isBlank()) {
                throw new ServiceException("Invalid category slug");
            }
            Category category = CategoryRepository.getCategoryBySlug(slug);
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
            Category existing = CategoryRepository.getCategoryBySlug(category.getSlug());
            if (existing != null) {
                throw new ServiceException("Category slug already exists");
            }
            boolean created = CategoryRepository.createCategory(category);
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
            Category existing = CategoryRepository.getCategoryById(category.getCategoryId());
            if (existing == null) {
                throw new ServiceException("Category not found");
            }
            Category slugOwner = CategoryRepository.getCategoryBySlug(category.getSlug());
            if (slugOwner != null && slugOwner.getCategoryId() != category.getCategoryId()) {
                throw new ServiceException("Category slug already exists");
            }
            boolean updated = CategoryRepository.updateCategory(category);
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
            boolean deleted = CategoryRepository.deleteCategory(categoryId);
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
        category.setName(ValidationUtil.sanitizeInput(category.getName()));
        category.setDescription(ValidationUtil.sanitizeInput(category.getDescription()));
        category.setSlug(ValidationUtil.sanitizeInput(category.getSlug()).toLowerCase());
    }
}
