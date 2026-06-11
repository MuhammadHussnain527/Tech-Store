package com.techstore.service;

import com.techstore.repository.RatingRepository;
import com.techstore.repository.UserRepository;
import com.techstore.dto.RatingResponse;
import com.techstore.model.ProductRating;
import com.techstore.model.User;
import com.techstore.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
public class RatingService {

    @Autowired
    private RatingRepository RatingRepository;

    @Autowired
    private UserRepository UserRepository;

    public List<RatingResponse> getRatingsByProduct(int productId) throws ServiceException {
        try {
            List<ProductRating> ratings = RatingRepository.getRatingsByProduct(productId);
            List<RatingResponse> responses = new ArrayList<>();

            for (ProductRating rating : ratings) {
                RatingResponse response = toResponse(rating);
                User user = UserRepository.findById(rating.getUserId());
                if (user != null) {
                    response.setUserName(user.getName());
                }
                responses.add(response);
            }

            return responses;
        } catch (SQLException e) {
            throw new ServiceException("Unable to load ratings", e);
        }
    }

    public RatingResponse getUserRating(int productId, int userId) throws ServiceException {
        try {
            ProductRating rating = RatingRepository.getUserRating(productId, userId);
            if (rating == null) {
                return null;
            }
            RatingResponse response = toResponse(rating);
            User user = UserRepository.findById(userId);
            if (user != null) {
                response.setUserName(user.getName());
            }
            return response;
        } catch (SQLException e) {
            throw new ServiceException("Unable to load rating", e);
        }
    }

    public void submitRating(int productId, int userId, int rating, String reviewText)
            throws ServiceException {

        validateRating(rating);
        reviewText = ValidationUtil.sanitizeInput(reviewText);

        try {
            ProductRating existing = RatingRepository.getUserRating(productId, userId);

            ProductRating productRating = new ProductRating();
            productRating.setProductId(productId);
            productRating.setUserId(userId);
            productRating.setRating(rating);
            productRating.setReviewText(reviewText);

            if (existing != null) {
                boolean updated = RatingRepository.updateRating(productRating);
                if (!updated) {
                    throw new ServiceException("Unable to update rating");
                }
            } else {
                boolean added = RatingRepository.addRating(productRating);
                if (!added) {
                    throw new ServiceException("Unable to submit rating");
                }
            }
        } catch (SQLException e) {
            throw new ServiceException("Unable to submit rating", e);
        }
    }

    private void validateRating(int rating) throws ServiceException {
        if (rating < 1 || rating > 5) {
            throw new ServiceException("Rating must be between 1 and 5");
        }
    }

    private RatingResponse toResponse(ProductRating rating) {
        RatingResponse response = new RatingResponse();
        response.setRatingId(rating.getRatingId());
        response.setProductId(rating.getProductId());
        response.setUserId(rating.getUserId());
        response.setRating(rating.getRating());
        response.setReviewText(rating.getReviewText());
        response.setCreatedAt(rating.getCreatedAt());
        return response;
    }
}

