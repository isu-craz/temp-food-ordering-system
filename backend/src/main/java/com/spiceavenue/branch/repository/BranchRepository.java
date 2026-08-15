package com.spiceavenue.branch.repository;

import com.spiceavenue.branch.entity.Branch;
import com.spiceavenue.common.enums.EntityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByStatus(EntityStatus status);
    boolean existsByBranchName(String branchName);
    boolean existsByEmail(String email);
    boolean existsByContactNumber(String contactNumber);
    Optional<Branch> findByManager_UserId(Long managerId);
}
