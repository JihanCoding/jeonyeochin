package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.Post;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    // 특정 사용자의 게시글 목록 페이징 조회
    Page<Post> findAllByUserId(Integer userId, Pageable pageable);

    List<Post> findByUserId(Integer userId);

    
}

