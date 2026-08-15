package com.spiceavenue.fulfillment.controller;

import com.spiceavenue.common.dto.ApiResponse;
import com.spiceavenue.common.enums.OrderStatus;
import com.spiceavenue.fulfillment.dto.FulfillmentDtos.*;
import com.spiceavenue.fulfillment.service.OrderFulfillmentService;
import com.spiceavenue.ordering.dto.OrderingDtos.OrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fulfillment")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
@Tag(name = "Member 4 - Order Fulfillment Management", description = "Endpoints for kitchen queue, confirmation, status progression, and rider assignment")
public class OrderFulfillmentController {

    private final OrderFulfillmentService fulfillmentService;

    @GetMapping("/orders/incoming")
    @Operation(summary = "Get incoming orders for a branch (optionally filter by status)")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getIncomingOrders(
            @RequestParam Long branchId,
            @RequestParam(required = false) OrderStatus status) {
        List<OrderResponse> orders = fulfillmentService.getIncomingOrders(branchId, status);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PatchMapping("/orders/{id}/confirm")
    @Operation(summary = "Confirm an incoming order and set estimated preparation minutes")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(
            @PathVariable Long id, @Valid @RequestBody ConfirmOrderRequest request) {
        OrderResponse order = fulfillmentService.confirmOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order confirmed successfully", order));
    }

    @PatchMapping("/orders/{id}/reject")
    @Operation(summary = "Reject an order with a mandatory reason")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectOrder(
            @PathVariable Long id, @Valid @RequestBody RejectOrderRequest request) {
        OrderResponse order = fulfillmentService.rejectOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order rejected", order));
    }

    @PatchMapping("/orders/{id}/preparing")
    @Operation(summary = "Advance order status to PREPARING")
    public ResponseEntity<ApiResponse<OrderResponse>> markPreparing(@PathVariable Long id) {
        OrderResponse order = fulfillmentService.markAsPreparing(id);
        return ResponseEntity.ok(ApiResponse.success("Order is now PREPARING", order));
    }

    @PatchMapping("/orders/{id}/ready-pickup")
    @Operation(summary = "Mark pickup order as READY_FOR_PICKUP")
    public ResponseEntity<ApiResponse<OrderResponse>> markReadyForPickup(@PathVariable Long id) {
        OrderResponse order = fulfillmentService.markReadyForPickup(id);
        return ResponseEntity.ok(ApiResponse.success("Pickup order is READY_FOR_PICKUP", order));
    }

    @PatchMapping("/orders/{id}/picked-up")
    @Operation(summary = "Mark pickup order as PICKED_UP (completes workflow)")
    public ResponseEntity<ApiResponse<OrderResponse>> markPickedUp(@PathVariable Long id) {
        OrderResponse order = fulfillmentService.markPickedUp(id);
        return ResponseEntity.ok(ApiResponse.success("Order collected by customer (PICKED_UP)", order));
    }

    @PatchMapping("/orders/{id}/ready-delivery")
    @Operation(summary = "Mark delivery order as READY_FOR_DELIVERY")
    public ResponseEntity<ApiResponse<OrderResponse>> markReadyForDelivery(@PathVariable Long id) {
        OrderResponse order = fulfillmentService.markReadyForDelivery(id);
        return ResponseEntity.ok(ApiResponse.success("Delivery order is READY_FOR_DELIVERY", order));
    }

    @PatchMapping("/orders/{id}/assign-rider")
    @Operation(summary = "Assign an available delivery rider to a delivery order")
    public ResponseEntity<ApiResponse<OrderResponse>> assignRider(
            @PathVariable Long id, @Valid @RequestBody AssignRiderRequest request) {
        OrderResponse order = fulfillmentService.assignDeliveryRider(id, request);
        return ResponseEntity.ok(ApiResponse.success("Rider assigned to delivery order successfully", order));
    }
}
