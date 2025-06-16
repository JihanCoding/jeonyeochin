package com.smhrd.jeonyeochin.repository;

import com.smhrd.jeonyeochin.entity.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // 이메일로 사용자 조회
    Optional<User> findByUserEmail(String userEmail);

    // 이메일 중복 여부 확인
    boolean existsByUserEmail(String userEmail);

    // 닉네임 중복 여부 확인
    boolean existsByUserNick(String userNick);
}