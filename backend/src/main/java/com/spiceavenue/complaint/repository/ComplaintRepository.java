package com.spiceavenue.complaint.repository;

import com.spiceavenue.common.enums.ComplaintStatus;
import com.spiceavenue.complaint.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCustomer_UserIdOrderByCreatedAtDesc(Long customerId);
    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);
    List<Complaint> findByOrder_Branch_BranchId(Long branchId);
}
