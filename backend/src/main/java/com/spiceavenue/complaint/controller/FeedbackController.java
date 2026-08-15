package com.spiceavenue.complaint.controller;

import com.spiceavenue.common.dto.ApiResponse;
import com.spiceavenue.common.enums.ComplaintStatus;
import com.spiceavenue.complaint.dto.FeedbackDtos.*;
import com.spiceavenue.complaint.service.ComplaintAndReviewService;
import com.spiceavenue.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Member 6 - Complaint & Review Management", description = "Endpoints for customer complaints, post-order star reviews, and supervisor feedback analytics")
public class FeedbackController {

    private final ComplaintAndReviewService feedbackService;

    // Complaints Endpoints
    @PostMapping("/customer/complaints")
    @Operation(summary = "Submit a complaint for a completed order (Customer)")
    public ResponseEntity<ApiResponse<ComplaintResponse>> submitComplaint(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody SubmitComplaintRequest request) {
        ComplaintResponse complaint = feedbackService.submitComplaint(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Complaint submitted successfully", complaint));
    }

    @GetMapping("/customer/my-complaints")
    @Operation(summary = "View current customer's complaints and statuses")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(
            @AuthenticationPrincipal UserDetailsImpl user) {
        List<ComplaintResponse> complaints = feedbackService.getCustomerComplaints(user.getId());
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @GetMapping("/supervisor/complaints")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Get list of customer complaints for supervision queue")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getSupervisorComplaints(
            @RequestParam(required = false) ComplaintStatus status) {
        List<ComplaintResponse> complaints = feedbackService.getSupervisorComplaints(status);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @PatchMapping("/supervisor/complaints/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Update complaint status (e.g. mark IN_PROGRESS)")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @PathVariable Long id, @RequestParam ComplaintStatus status) {
        ComplaintResponse complaint = feedbackService.updateComplaintStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated", complaint));
    }

    @PatchMapping("/supervisor/complaints/{id}/resolve")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Resolve customer complaint with mandatory resolution notes")
    public ResponseEntity<ApiResponse<ComplaintResponse>> resolveComplaint(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody ResolveComplaintRequest request) {
        ComplaintResponse complaint = feedbackService.resolveComplaint(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Complaint resolved and closed successfully", complaint));
    }

    // Reviews Endpoints
    @PostMapping("/customer/reviews")
    @Operation(summary = "Submit a 1-5 star review for a completed order")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody SubmitReviewRequest request) {
        ReviewResponse review = feedbackService.submitReview(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review submitted successfully", review));
    }

    @PutMapping("/customer/reviews/{id}")
    @Operation(summary = "Update your existing review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody UpdateReviewRequest request) {
        ReviewResponse review = feedbackService.updateReview(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review updated", review));
    }

    @DeleteMapping("/customer/reviews/{id}")
    @Operation(summary = "Delete your submitted review")
    public ResponseEntity<ApiResponse<String>> deleteReview(
            @PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        feedbackService.deleteReview(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    @GetMapping("/branches/{branchId}/reviews")
    @Operation(summary = "Get customer reviews for a specific branch")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getBranchReviews(@PathVariable Long branchId) {
        List<ReviewResponse> reviews = feedbackService.getReviewsForBranch(branchId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/supervisor/feedback-analytics")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'OPS_MANAGER', 'ADMIN')")
    @Operation(summary = "Get overall feedback analytics and rating metrics")
    public ResponseEntity<ApiResponse<FeedbackAnalyticsResponse>> getFeedbackAnalytics() {
        FeedbackAnalyticsResponse analytics = feedbackService.getFeedbackAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
