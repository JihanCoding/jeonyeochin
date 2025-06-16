package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.Like;
import com.smhrd.jeonyeochin.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class LikeService {
    
    @Autowired
    private LikeRepository likeRepository;

    // 좋아요 토글(추가/취소)
    public boolean toggleLike(Integer userId, Integer postId) {
        boolean exists = likeRepository.existsByUserIdAndPostId(userId, postId);
        if (exists) {
            likeRepository.deleteByUserIdAndPostId(userId, postId);
            return false; // 좋아요 취소
        } else {
            Like like = new Like();
            like.setUserId(userId);
            like.setPostId(postId);
            like.setCreatedAt(java.time.LocalDateTime.now());
            likeRepository.save(like);
            return true; // 좋아요 추가
        }
    }

    // 게시글별 좋아요 개수 반환
    public int countLikesByPostId(Integer postId) {
        return likeRepository.countByPostId(postId);
    }
}