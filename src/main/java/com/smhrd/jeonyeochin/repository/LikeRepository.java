package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.Like;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Integer> {
	// 특정 사용자가 특정 게시글에 좋아요를 눌렀는지 확인
    boolean existsByUserIdAndPostId(Integer userId, Integer postId);

    // 특정 사용자의 특정 게시글 좋아요 삭제
    void deleteByUserIdAndPostId(Integer userId, Integer postId);
    
    // 게시글별 좋아요 개수 반환
    int countByPostId(Integer postId);
}