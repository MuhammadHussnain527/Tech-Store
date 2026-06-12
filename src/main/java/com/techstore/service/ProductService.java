package com.techstore.service;

import com.techstore.repository.ProductRepository;
import com.techstore.model.Product;
import com.techstore.util.ValidationUtil;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository ProductRepository;

    public ProductService() {
    }

    public List<Product> getAllProducts()
            throws ServiceException {

        try {

            return ProductRepository.getAllProducts();

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to load products",
                    e);
        }
    }

    public List<Product> getAllProductsIncludingInactive() throws ServiceException {
        try {
            return ProductRepository.getAllProductsIncludingInactive();
        } catch (SQLException e) {
            throw new ServiceException("Unable to load products", e);
        }
    }

    public Product getProductById(int productId)
            throws ServiceException {

        try {

            Product product = ProductRepository.getProductById(productId);

            if (product == null) {

                throw new ServiceException(
                        "Product not found");
            }

            return product;

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to load product",
                    e);
        }
    }

    public List<Product> getProductsByCategory(
            int categoryId) throws ServiceException {

        try {

            return ProductRepository.getProductsByCategory(
                    categoryId);

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to load category products",
                    e);
        }
    }

    public List<Product> searchProducts(
            String keyword) throws ServiceException {

        try {

            keyword = ValidationUtil.sanitizeInput(keyword);

            if (keyword == null ||
                    keyword.isBlank()) {

                throw new ServiceException(
                        "Search keyword required");
            }

            return ProductRepository.searchProducts(
                    keyword);

        } catch (SQLException e) {

            throw new ServiceException(
                    "Search failed",
                    e);
        }
    }

    public void addProduct(Product product)
            throws ServiceException {

        validateProduct(product);

        try {

            boolean created = ProductRepository.addProduct(product);

            if (!created) {

                throw new ServiceException(
                        "Unable to create product");
            }

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to create product",
                    e);
        }
    }

    public void updateProduct(Product product)
            throws ServiceException {

        validateProduct(product);

        try {

            Product existing = ProductRepository.getProductById(
                    product.getProductId());

            if (existing == null) {

                throw new ServiceException(
                        "Product not found");
            }

            boolean updated = ProductRepository.updateProduct(product);

            if (!updated) {

                throw new ServiceException(
                        "Unable to update product");
            }

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to update product",
                    e);
        }
    }

    public void deleteProduct(
            int productId) throws ServiceException {

        try {

            Product existing = ProductRepository.getProductById(
                    productId);

            if (existing == null) {

                throw new ServiceException(
                        "Product not found");
            }

            boolean deleted = ProductRepository.deleteProduct(productId);

            if (!deleted) {

                throw new ServiceException("Unable to delete product");
            }

        } catch (SQLException e) {

            throw new ServiceException("Unable to delete product", e);
        }
    }

    private void validateProduct(Product product) throws ServiceException {

        if (product == null) {

            throw new ServiceException("Product is required");
        }

        if (product.getCategoryId() <= 0) {

            throw new ServiceException("Invalid category");
        }

        if (product.getName() == null || product.getName().isBlank()) {

            throw new ServiceException("Product name is required");
        }

        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ServiceException("Invalid price");
        }

        if (product.getStockQty() < 0) {

            throw new ServiceException("Invalid stock quantity");
        }

        product.setName(ValidationUtil.sanitizeInput(product.getName()));

        product.setBrand(ValidationUtil.sanitizeInput(product.getBrand()));

        product.setDescription(
                ValidationUtil.sanitizeInput(product.getDescription()));

        product.setSpecs(
                ValidationUtil.sanitizeInput(product.getSpecs()));

        product.setImageUrl(
                ValidationUtil.sanitizeInput(product.getImageUrl()));
    }

    public int countAllProducts() throws ServiceException {
        try {
            return ProductRepository.countAllProducts();
        } catch (SQLException e) {
            throw new ServiceException("Unable to count products", e);
        }
    }

    public List<Product> getLowStockProducts(int threshold) throws ServiceException {
        try {
            return ProductRepository.getLowStockProducts(threshold);
        } catch (SQLException e) {
            throw new ServiceException("Unable to load low stock products", e);
        }
    }
}
