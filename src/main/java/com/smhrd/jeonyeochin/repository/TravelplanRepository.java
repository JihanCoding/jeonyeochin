package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.Travelplan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelplanRepository extends JpaRepository<Travelplan, Integer> {
}