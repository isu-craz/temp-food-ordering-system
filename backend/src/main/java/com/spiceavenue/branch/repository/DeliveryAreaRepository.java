package com.spiceavenue.branch.repository;

import com.spiceavenue.branch.entity.DeliveryArea;
import com.spiceavenue.common.enums.EntityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryAreaRepository extends JpaRepository<DeliveryArea, Long> {
    List<DeliveryArea> findByBranch_BranchIdAndStatus(Long branchId, EntityStatus status);
    List<DeliveryArea> findByBranch_BranchId(Long branchId);
}
