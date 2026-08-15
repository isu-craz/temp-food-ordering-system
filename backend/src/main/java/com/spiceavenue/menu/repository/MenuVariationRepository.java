package com.spiceavenue.menu.repository;

import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.menu.entity.MenuVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuVariationRepository extends JpaRepository<MenuVariation, Long> {
    List<MenuVariation> findByMenuItem_ItemIdAndStatus(Long itemId, EntityStatus status);
}
