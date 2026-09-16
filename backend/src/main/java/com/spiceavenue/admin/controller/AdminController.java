package com.spiceavenue.admin.controller;

import com.spiceavenue.admin.dto.AdminDtos.*;
import com.spiceavenue.admin.service.AdminService;
import com.spiceavenue.common.dto.ApiResponse;
import com.spiceavenue.common.enums.EntityStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "System Administration", description = "Endpoints for managing staff accounts, system settings, and audit logs")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "Get list of all staff and user accounts")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        List<UserResponseDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new staff user account in the database")
    public ResponseEntity<ApiResponse<UserResponseDto>> createUser(@Valid @RequestBody CreateUserRequestDto request) {
        UserResponseDto createdUser = adminService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("Staff account created successfully in MySQL database", createdUser));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Toggle user account active/inactive status")
    public ResponseEntity<ApiResponse<UserResponseDto>> toggleUserStatus(
            @PathVariable Long userId,
            @RequestParam EntityStatus status) {
        UserResponseDto updatedUser = adminService.toggleUserStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updatedUser));
    }

    @PostMapping("/users/{userId}/reset-password")
    @Operation(summary = "Reset password for a user account")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long userId,
            @Valid @RequestBody ResetPasswordRequestDto request) {
        adminService.resetPassword(userId, request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }
}
