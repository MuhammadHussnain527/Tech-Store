package com.techstore.controller;

import com.techstore.model.Category;
import com.techstore.service.CategoryService;
import com.techstore.service.ServiceException;
import com.techstore.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCategories(
            @RequestParam(required = false) Integer id,
            @RequestParam(required = false) String slug) {

        try {
            if (id != null) {
                Category category = categoryService.getCategoryById(id);
                if (category == null) {
                    return ResponseUtil.error("Category not found", HttpStatus.NOT_FOUND);
                }
                return ResponseUtil.success("Category found", category, HttpStatus.OK);
            }

            if (slug != null && !slug.isBlank()) {
                Category category = categoryService.getCategoryBySlug(slug);
                if (category == null) {
                    return ResponseUtil.error("Category not found", HttpStatus.NOT_FOUND);
                }
                return ResponseUtil.success("Category found", category, HttpStatus.OK);
            }

            List<Category> categories = categoryService.getAllCategories();
            return ResponseUtil.success("Categories loaded", categories, HttpStatus.OK);

        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Invalid request", HttpStatus.BAD_REQUEST);
        }
    }
}

