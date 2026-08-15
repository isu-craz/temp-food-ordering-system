package com.spiceavenue.ordering.dto;

import com.spiceavenue.common.enums.OrderStatus;
import com.spiceavenue.common.enums.OrderType;
import com.spiceavenue.common.enums.PaymentMethod;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderingDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateAddressRequest {
        private String label;
        @NotNull(message = "House number is required")
        private String houseNumber;
        @NotNull(message = "Street is required")
        private String street;
        @NotNull(message = "Delivery Area ID is required")
        private Long areaId;
        private boolean isDefault;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressResponse {
        private Long addressId;
        private String label;
        private String houseNumber;
        private String street;
        private Long areaId;
        private String areaName;
        private BigDecimal deliveryFee;
        private boolean isDefault;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemRequest {
        @NotNull(message = "Item ID is required")
        private Long itemId;
        private Long variationId;
        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlaceOrderRequest {
        @NotNull(message = "Branch ID is required")
        private Long branchId;

        @NotNull(message = "Order type is required")
        private OrderType orderType;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;

        private Long deliveryAddressId; // Null for pickup

        @NotEmpty(message = "Cart cannot be empty")
        private List<CartItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long orderItemId;
        private Long itemId;
        private String itemName;
        private Long variationId;
        private String variationName;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private Long orderId;
        private String orderNumber;
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private Long branchId;
        private String branchName;
        private OrderType orderType;
        private OrderStatus status;
        private BigDecimal subtotal;
        private BigDecimal deliveryFee;
        private BigDecimal totalAmount;
        private PaymentMethod paymentMethod;
        private String deliveryAddressText;
        private Integer estimatedPrepMinutes;
        private String rejectionReason;
        private String cancellationReason;
        private LocalDateTime createdAt;
        private List<OrderItemResponse> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CancelOrderRequest {
        private String cancellationReason;
    }
}
