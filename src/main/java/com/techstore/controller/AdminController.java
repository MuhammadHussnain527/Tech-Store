package com.techstore.controller;

import com.techstore.model.Category;
import com.techstore.model.Order;
import com.techstore.model.Product;
import com.techstore.service.CategoryService;
import com.techstore.service.FileStorageService;
import com.techstore.service.OrderService;
import com.techstore.service.ProductService;
import com.techstore.service.ServiceException;
import com.techstore.service.UserService;
import com.techstore.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    // --- Dashboard ---
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        try {
            Map<String, Object> dashboard = new LinkedHashMap<>();
            dashboard.put("totalUsers",    userService.countAllUsers());
            dashboard.put("totalProducts", productService.countAllProducts());
            dashboard.put("totalOrders",   orderService.countAllOrders());
            dashboard.put("totalRevenue",  orderService.getTotalRevenue());
            dashboard.put("recentOrders",  orderService.getRecentOrders(5));
            dashboard.put("lowStockProducts", productService.getLowStockProducts(10));
            return ResponseUtil.success("Dashboard data loaded", dashboard, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Unable to load dashboard", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/products/upload")
    public ResponseEntity<Map<String, Object>> uploadProductImage(
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = fileStorageService.storeProductImage(file);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("imageUrl", imageUrl);
            return ResponseUtil.success("Image uploaded", data, HttpStatus.CREATED);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- Categories ---
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories(@RequestParam(required = false) Integer id) {
        try {
            if (id != null) {
                Category category = categoryService.getCategoryById(id);
                if (category == null) {
                    return ResponseUtil.error("Category not found", HttpStatus.NOT_FOUND);
                }
                return ResponseUtil.success("Category loaded", category, HttpStatus.OK);
            }
            List<Category> categories = categoryService.getAllCategories();
            return ResponseUtil.success("Categories loaded", categories, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/categories")
    public ResponseEntity<Map<String, Object>> createCategory(@RequestBody Category category) {
        try {
            categoryService.createCategory(category);
            return ResponseUtil.success("Category created", null, HttpStatus.CREATED);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/categories")
    public ResponseEntity<Map<String, Object>> updateCategory(@RequestBody Category category) {
        try {
            categoryService.updateCategory(category);
            return ResponseUtil.success("Category updated", null, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/categories")
    public ResponseEntity<Map<String, Object>> deleteCategory(@RequestParam Integer id) {
        try {
            if (id == null) {
                return ResponseUtil.error("Category id required", HttpStatus.BAD_REQUEST);
            }
            categoryService.deleteCategory(id);
            return ResponseUtil.success("Category deleted", null, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- Products ---
    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts(@RequestParam(required = false) Integer id) {
        try {
            if (id != null) {
                Product product = productService.getProductById(id);
                if (product == null) {
                    return ResponseUtil.error("Product not found", HttpStatus.NOT_FOUND);
                }
                return ResponseUtil.success("Product loaded", product, HttpStatus.OK);
            }
            List<Product> products = productService.getAllProductsIncludingInactive();
            return ResponseUtil.success("Products loaded", products, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Product product) {
        try {
            productService.addProduct(product);
            return ResponseUtil.success("Product created successfully", null, HttpStatus.CREATED);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Unable to create product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/products")
    public ResponseEntity<Map<String, Object>> updateProduct(@RequestBody Product product) {
        try {
            productService.updateProduct(product);
            return ResponseUtil.success("Product updated successfully", null, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Unable to update product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/products")
    public ResponseEntity<Map<String, Object>> deleteProduct(@RequestParam Integer id) {
        try {
            if (id == null) {
                return ResponseUtil.error("Product id is required", HttpStatus.BAD_REQUEST);
            }
            productService.deleteProduct(id);
            return ResponseUtil.success("Product deleted successfully", null, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- Orders ---
    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseUtil.success("Orders loaded successfully", orders, HttpStatus.OK);
        } catch (ServiceException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/orders")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @RequestParam Integer orderId,
            @RequestParam String status) {
        try {
            orderService.updateOrderStatus(orderId, status);
            return ResponseUtil.success("Order status updated", null, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

