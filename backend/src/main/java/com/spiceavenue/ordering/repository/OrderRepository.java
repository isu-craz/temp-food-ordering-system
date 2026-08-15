package com.spiceavenue.ordering.repository;

import com.spiceavenue.common.enums.OrderStatus;
import com.spiceavenue.ordering.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer_UserIdOrderByCreatedAtDesc(Long customerId);
    List<Order> findByBranch_BranchIdOrderByCreatedAtDesc(Long branchId);
    List<Order> findByBranch_BranchIdAndStatusOrderByCreatedAtAsc(Long branchId, OrderStatus status);
    Optional<Order> findByOrderNumber(String orderNumber);
}
