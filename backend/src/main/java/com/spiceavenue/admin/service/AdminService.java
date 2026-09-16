package com.spiceavenue.admin.service;

import com.spiceavenue.admin.dto.AdminDtos.*;
import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.common.enums.RiderStatus;
import com.spiceavenue.common.enums.UserRole;
import com.spiceavenue.common.exception.BadRequestException;
import com.spiceavenue.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDto createUser(CreateUserRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        String phone = (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank())
                ? request.getPhoneNumber()
                : "077" + (1000000 + (int)(Math.random() * 8999999));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(phone)
                .role(request.getRole())
                .status(EntityStatus.ACTIVE)
                .riderStatus(request.getRole() == UserRole.RIDER ? RiderStatus.AVAILABLE : RiderStatus.OFFLINE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Admin created new user account in MySQL database: {} ({})", savedUser.getEmail(), savedUser.getRole());
        return mapToUserResponseDto(savedUser);
    }

    @Transactional
    public UserResponseDto toggleUserStatus(Long userId, EntityStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setStatus(status);
        User updated = userRepository.save(user);
        log.info("User {} status updated to {}", userId, status);
        return mapToUserResponseDto(updated);
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (user.getRole() == UserRole.CUSTOMER) {
            throw new BadRequestException("Customer passwords cannot be reset by System Admin.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password reset successfully for user id {}", userId);
    }

    private UserResponseDto mapToUserResponseDto(User user) {
        String branch = switch (user.getRole()) {
            case ADMIN, OPS_MANAGER -> "All Branches";
            case BRANCH_MANAGER -> "Colombo Main";
            case RIDER -> "Colombo Main";
            case SUPERVISOR -> "Customer Support HQ";
            default -> "External";
        };

        return UserResponseDto.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus() != null ? user.getStatus() : EntityStatus.ACTIVE)
                .riderStatus(user.getRiderStatus())
                .branchName(branch)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
