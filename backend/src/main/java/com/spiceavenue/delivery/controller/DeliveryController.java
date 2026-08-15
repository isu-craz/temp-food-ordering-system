package com.spiceavenue.delivery.controller;

import com.spiceavenue.common.dto.ApiResponse;
import com.spiceavenue.delivery.dto.DeliveryDtos.*;
import com.spiceavenue.delivery.service.DeliveryService;
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
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@Tag(name = "Member 5 - Delivery Management", description = "Endpoints for rider availability, task acceptance, and delivery status progression")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/riders/available")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN', 'OPS_MANAGER')")
    @Operation(summary = "Get all available riders for assignment")
    public ResponseEntity<ApiResponse<List<AvailableRiderResponse>>> getAvailableRiders() {
        List<AvailableRiderResponse> riders = deliveryService.getAvailableRiders();
        return ResponseEntity.ok(ApiResponse.success(riders));
    }

    @PatchMapping("/riders/my-status")
    @PreAuthorize("hasRole('RIDER')")
    @Operation(summary = "Update rider's own availability status (AVAILABLE, BUSY, OFFLINE)")
    public ResponseEntity<ApiResponse<String>> updateMyStatus(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody UpdateRiderStatusRequest request) {
        deliveryService.updateRiderAvailability(user.getId(), request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Availability updated to " + request.getStatus(), null));
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('RIDER')")
    @Operation(summary = "Get active delivery tasks assigned to the current rider")
    public ResponseEntity<ApiResponse<List<DeliveryTaskResponse>>> getMyTasks(@AuthenticationPrincipal UserDetailsImpl user) {
        List<DeliveryTaskResponse> tasks = deliveryService.getRiderAssignedTasks(user.getId());
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('RIDER')")
    @Operation(summary = "Get completed delivery history for the current rider")
    public ResponseEntity<ApiResponse<List<DeliveryTaskResponse>>> getMyHistory(@AuthenticationPrincipal UserDetailsImpl user) {
        List<DeliveryTaskResponse> history = deliveryService.getRiderHistory(user.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PatchMapping("/tasks/{deliveryId}/accept")
    @PreAuthorize("hasRole('RIDER')")
    @Operation(summary = "Accept an assigned delivery task (automatically sets rider status to BUSY)")
    public ResponseEntity<ApiResponse<DeliveryTaskResponse>> acceptDelivery(
            @PathVariable Long deliveryId, @AuthenticationPrincipal UserDetailsImpl user) {
        DeliveryTaskResponse response = deliveryService.acceptDelivery(deliveryId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Delivery accepted", response));
    }

    @PatchMapping("/tasks/{deliveryId}/out-for-delivery")
    @PreAuthorize("hasRole('RIDER')")
    @Operation(summary = "Mark order as OUT_FOR_DELIVERY after picking up package from branch")
    public ResponseEntity<ApiResponse<DeliveryTaskResponse>> markOutForDelivery(
            @PathVariable Long deliveryId, @AuthenticationPrincipal UserDetailsImpl user) {
        DeliveryTaskResponse response = deliveryService.markOutForDelivery(deliveryId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Order is now OUT_FOR_DELIVERY", response));
    }

    @PatchMapping("/tasks/{deliveryId}/delivered")
    @PreAuthorize("hasRole('RIDER')")
    @Operation(summary = "Mark order as DELIVERED upon customer handover (auto sets rider to AVAILABLE)")
    public ResponseEntity<ApiResponse<DeliveryTaskResponse>> markDelivered(
            @PathVariable Long deliveryId, @AuthenticationPrincipal UserDetailsImpl user) {
        DeliveryTaskResponse response = deliveryService.markDelivered(deliveryId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Order marked as DELIVERED successfully", response));
    }
}
