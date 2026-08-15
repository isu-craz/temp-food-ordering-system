package com.spiceavenue.complaint.service;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import com.spiceavenue.common.enums.ComplaintStatus;
import com.spiceavenue.common.enums.OrderStatus;
import com.spiceavenue.common.exception.BadRequestException;
import com.spiceavenue.common.exception.ResourceNotFoundException;
import com.spiceavenue.complaint.dto.FeedbackDtos.*;
import com.spiceavenue.complaint.entity.Complaint;
import com.spiceavenue.complaint.entity.Review;
import com.spiceavenue.complaint.repository.ComplaintRepository;
import com.spiceavenue.complaint.repository.ReviewRepository;
import com.spiceavenue.ordering.entity.Order;
import com.spiceavenue.ordering.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintAndReviewService {

    private final ComplaintRepository complaintRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // Complaints Logic
    @Transactional
    public ComplaintResponse submitComplaint(Long customerId, SubmitComplaintRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getUserId().equals(customerId)) {
            throw new BadRequestException("You can only submit complaints for your own orders");
        }

        if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.PICKED_UP) {
            throw new BadRequestException("Complaints can only be submitted after an order is completed (DELIVERED or PICKED_UP)");
        }

        Complaint complaint = Complaint.builder()
                .order(order)
                .customer(customer)
                .category(request.getCategory())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(ComplaintStatus.PENDING)
                .build();

        return mapToComplaintResponse(complaintRepository.save(complaint));
    }

    public List<ComplaintResponse> getCustomerComplaints(Long customerId) {
        return complaintRepository.findByCustomer_UserIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getSupervisorComplaints(ComplaintStatus status) {
        List<Complaint> complaints = status != null
                ? complaintRepository.findByStatusOrderByCreatedAtDesc(status)
                : complaintRepository.findAll();
        return complaints.stream().map(this::mapToComplaintResponse).collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long complaintId, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getStatus() == ComplaintStatus.RESOLVED) {
            throw new BadRequestException("Closed/Resolved complaints cannot be modified");
        }

        complaint.setStatus(status);
        return mapToComplaintResponse(complaintRepository.save(complaint));
    }

    @Transactional
    public ComplaintResponse resolveComplaint(Long complaintId, Long supervisorId, ResolveComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor not found"));

        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResolutionNotes(request.getResolutionNotes());
        complaint.setResolvedBy(supervisor);
        complaint.setResolvedAt(LocalDateTime.now());

        return mapToComplaintResponse(complaintRepository.save(complaint));
    }

    // Reviews Logic
    @Transactional
    public ReviewResponse submitReview(Long customerId, SubmitReviewRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getUserId().equals(customerId)) {
            throw new BadRequestException("You can only submit reviews for your own orders");
        }

        if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.PICKED_UP) {
            throw new BadRequestException("Reviews can only be submitted for completed orders");
        }

        if (reviewRepository.existsByOrder_OrderId(order.getOrderId())) {
            throw new BadRequestException("You have already reviewed this order");
        }

        Review review = Review.builder()
                .order(order)
                .customer(customer)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return mapToReviewResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, Long customerId, UpdateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getCustomer().getUserId().equals(customerId)) {
            throw new BadRequestException("You can only edit your own reviews");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return mapToReviewResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long reviewId, Long customerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getCustomer().getUserId().equals(customerId)) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    public List<ReviewResponse> getReviewsForBranch(Long branchId) {
        return reviewRepository.findByOrder_Branch_BranchIdOrderByReviewDateDesc(branchId).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    public FeedbackAnalyticsResponse getFeedbackAnalytics() {
        List<Review> reviews = reviewRepository.findAll();
        List<Complaint> complaints = complaintRepository.findAll();

        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        long fiveStar = reviews.stream().filter(r -> r.getRating() == 5).count();
        long fourStar = reviews.stream().filter(r -> r.getRating() == 4).count();
        long threeStar = reviews.stream().filter(r -> r.getRating() == 3).count();
        long twoStar = reviews.stream().filter(r -> r.getRating() == 2).count();
        long oneStar = reviews.stream().filter(r -> r.getRating() == 1).count();

        long resolved = complaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count();
        long pending = complaints.stream().filter(c -> c.getStatus() == ComplaintStatus.PENDING).count();

        return FeedbackAnalyticsResponse.builder()
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews(reviews.size())
                .fiveStarCount(fiveStar)
                .fourStarCount(fourStar)
                .threeStarCount(threeStar)
                .twoStarCount(twoStar)
                .oneStarCount(oneStar)
                .totalComplaints(complaints.size())
                .resolvedComplaints(resolved)
                .pendingComplaints(pending)
                .build();
    }

    private ComplaintResponse mapToComplaintResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .complaintId(complaint.getComplaintId())
                .orderId(complaint.getOrder().getOrderId())
                .orderNumber(complaint.getOrder().getOrderNumber())
                .customerId(complaint.getCustomer().getUserId())
                .customerName(complaint.getCustomer().getFullName())
                .customerPhone(complaint.getCustomer().getPhoneNumber())
                .category(complaint.getCategory())
                .description(complaint.getDescription())
                .imageUrl(complaint.getImageUrl())
                .status(complaint.getStatus())
                .resolutionNotes(complaint.getResolutionNotes())
                .resolvedByName(complaint.getResolvedBy() != null ? complaint.getResolvedBy().getFullName() : null)
                .resolvedAt(complaint.getResolvedAt())
                .createdAt(complaint.getCreatedAt())
                .build();
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .orderId(review.getOrder().getOrderId())
                .orderNumber(review.getOrder().getOrderNumber())
                .customerId(review.getCustomer().getUserId())
                .customerName(review.getCustomer().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewDate(review.getReviewDate())
                .build();
    }
}
