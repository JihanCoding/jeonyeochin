package com.smhrd.jeonyeochin.repository;

import com.smhrd.jeonyeochin.entity.Info;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InfoRepository extends JpaRepository<Info, Integer> {
}