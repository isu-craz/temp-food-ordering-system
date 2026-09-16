package com.spiceavenue.admin.dto;

import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.common.enums.RiderStatus;
import com.spiceavenue.common.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AdminDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponseDto {
        private Long userId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private UserRole role;
        private EntityStatus status;
        private RiderStatus riderStatus;
        private String branchName;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequestDto {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        private String phoneNumber;

        @NotNull(message = "Role is required")
        private UserRole role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequestDto {
        @NotBlank(message = "New password is required")
        private String password;
    }
}
