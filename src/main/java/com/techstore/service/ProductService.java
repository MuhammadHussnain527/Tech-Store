package com.techstore.service;

import com.techstore.dao.ProductDAO;
import com.techstore.model.Product;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

public class ProductService {

    private final ProductDAO productDAO;

    public ProductService() {
        this.productDAO = new ProductDAO();
    }

    public List<Product> getAllProducts()
            throws ServiceException {

        try {

            return productDAO.getAllProducts();

        } catch (SQLException e) {

            throw new ServiceException(
                    "Unable to load products",
                    e);
        }
    }

    public Product getProductById(int productId)
            throws ServiceException {

        try {

            Product product = productDAO.getProductById(productId);

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

            return productDAO.getProductsByCategory(
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

            keyword = sanitize(keyword);

            if (keyword == null ||
                    keyword.isBlank()) {

                throw new ServiceException(
                        "Search keyword required");
            }

            return productDAO.searchProducts(
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

            boolean created = productDAO.addProduct(product);

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

            Product existing = productDAO.getProductById(
                    product.getProductId());

            if (existing == null) {

                throw new ServiceException(
                        "Product not found");
            }

            boolean updated = productDAO.updateProduct(product);

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

            Product existing = productDAO.getProductById(
                    productId);

            if (existing == null) {

                throw new ServiceException(
                        "Product not found");
            }

            boolean deleted = productDAO.deleteProduct(productId);

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

        product.setName(sanitize(product.getName()));

        product.setBrand(sanitize(product.getBrand()));

        product.setDescription(
                sanitize(product.getDescription()));

        product.setSpecs(
                sanitize(product.getSpecs()));

        product.setImageUrl(
                sanitize(product.getImageUrl()));
    }

    private String sanitize(
            String value) {

        if (value == null) {
            return null;
        }

        return value
                .replaceAll("<[^>]*>", "")
                .trim();
    }
}