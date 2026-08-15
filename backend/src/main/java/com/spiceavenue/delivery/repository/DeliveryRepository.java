package com.spiceavenue.delivery.repository;

import com.spiceavenue.delivery.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByOrder_OrderId(Long orderId);
    List<Delivery> findByRider_UserIdAndStatus(Long riderId, Delivery.DeliveryStatus status);
    List<Delivery> findByRider_UserIdOrderByAssignedAtDesc(Long riderId);
    boolean existsByOrder_OrderId(Long orderId);
}
