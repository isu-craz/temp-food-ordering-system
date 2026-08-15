package com.spiceavenue.delivery.dto;

import com.spiceavenue.common.enums.RiderStatus;
import com.spiceavenue.delivery.entity.Delivery.DeliveryStatus;
import com.spiceavenue.ordering.dto.OrderingDtos.OrderResponse;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class DeliveryDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRiderStatusRequest {
        @NotNull(message = "Rider status is required")
        private RiderStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeliveryTaskResponse {
        private Long deliveryId;
        private Long orderId;
        private String orderNumber;
        private Long riderId;
        private String riderName;
        private String riderPhone;
        private DeliveryStatus deliveryStatus;
        private String customerName;
        private String customerPhone;
        private String deliveryAddress;
        private String branchName;
        private LocalDateTime assignedAt;
        private LocalDateTime acceptedAt;
        private LocalDateTime outForDeliveryAt;
        private LocalDateTime deliveredAt;
        private OrderResponse orderDetails;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AvailableRiderResponse {
        private Long riderId;
        private String fullName;
        private String phoneNumber;
        private RiderStatus riderStatus;
    }
}
