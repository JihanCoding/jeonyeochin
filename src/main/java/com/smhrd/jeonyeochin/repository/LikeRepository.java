package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.Like;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Integer> {;
}