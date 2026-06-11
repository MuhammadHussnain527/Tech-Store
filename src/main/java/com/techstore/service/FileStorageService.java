package com.techstore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp");

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".webp");

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String storeProductImage(MultipartFile file) throws ServiceException {
        if (file == null || file.isEmpty()) {
            throw new ServiceException("File is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ServiceException("Only JPEG, PNG, and WebP images are allowed");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getSafeExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ServiceException("Invalid file extension");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ServiceException("File size must not exceed 5MB");
        }

        try {
            Path productDir = Paths.get(uploadDir, "products");
            Files.createDirectories(productDir);

            String filename = UUID.randomUUID() + extension;
            Path target = productDir.resolve(filename);
            file.transferTo(target.toFile());

            return "/uploads/products/" + filename;
        } catch (IOException e) {
            throw new ServiceException("Unable to store file", e);
        }
    }

    private String getSafeExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }
}

