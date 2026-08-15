package com.spiceavenue.menu.repository;

import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.menu.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByBranch_BranchIdAndStatus(Long branchId, EntityStatus status);
    List<Category> findByBranch_BranchId(Long branchId);
    boolean existsByBranch_BranchIdAndCategoryName(Long branchId, String categoryName);
}
