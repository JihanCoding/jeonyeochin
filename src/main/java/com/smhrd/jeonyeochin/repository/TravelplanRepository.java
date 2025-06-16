package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.Travelplan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelplanRepository extends JpaRepository<Travelplan, Integer> {
	// 특정 사용자의 여행계획 목록 조회
    java.util.List<Travelplan> findAllByUserId(Integer userId);
}