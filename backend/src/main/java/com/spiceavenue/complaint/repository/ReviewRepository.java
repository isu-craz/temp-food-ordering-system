package com.spiceavenue.complaint.repository;

import com.spiceavenue.complaint.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByOrder_OrderId(Long orderId);
    List<Review> findByCustomer_UserIdOrderByReviewDateDesc(Long customerId);
    List<Review> findByOrder_Branch_BranchIdOrderByReviewDateDesc(Long branchId);
    boolean existsByOrder_OrderId(Long orderId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.order.branch.branchId = :branchId")
    Double calculateAverageRatingForBranch(@Param("branchId") Long branchId);
}
