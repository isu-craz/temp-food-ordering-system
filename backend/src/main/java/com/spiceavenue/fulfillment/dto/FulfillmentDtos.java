package com.spiceavenue.fulfillment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class FulfillmentDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConfirmOrderRequest {
        @NotNull(message = "Estimated prep time is required")
        @Min(value = 5, message = "Estimated prep time must be at least 5 minutes")
        private Integer estimatedPrepMinutes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RejectOrderRequest {
        @NotBlank(message = "Rejection reason is mandatory")
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssignRiderRequest {
        @NotNull(message = "Rider ID is required")
        private Long riderId;
    }
}
