package com.spiceavenue.menu.repository;

import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByBranch_BranchIdAndStatus(Long branchId, EntityStatus status);
    List<MenuItem> findByBranch_BranchId(Long branchId);
    List<MenuItem> findByCategory_CategoryIdAndStatus(Long categoryId, EntityStatus status);
    List<MenuItem> findByBranch_BranchIdAndFoodNameContainingIgnoreCaseAndStatus(Long branchId, String query, EntityStatus status);
}
