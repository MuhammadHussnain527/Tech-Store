package com.techstore.controller;

import com.techstore.model.Product;
import com.techstore.service.ProductService;
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
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) Integer id,
            @RequestParam(required = false) Integer category,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String search) {

        try {
            if (id != null) {
                Product product = productService.getProductById(id);
                if (product == null) {
                    return ResponseUtil.error("Product not found", HttpStatus.NOT_FOUND);
                }
                return ResponseUtil.success("Product found", product, HttpStatus.OK);
            }

            Integer categoryFilter = category != null ? category : categoryId;
            if (categoryFilter != null) {
                List<Product> products = productService.getProductsByCategory(categoryFilter);
                return ResponseUtil.success("Products loaded", products, HttpStatus.OK);
            }

            if (search != null && !search.isBlank()) {
                List<Product> products = productService.searchProducts(search);
                return ResponseUtil.success("Search completed", products, HttpStatus.OK);
            }

            List<Product> products = productService.getAllProducts();
            return ResponseUtil.success("Products loaded", products, HttpStatus.OK);

        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Invalid request", HttpStatus.BAD_REQUEST);
        }
    }
}

