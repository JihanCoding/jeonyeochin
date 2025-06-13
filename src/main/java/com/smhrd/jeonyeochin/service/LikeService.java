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

    // 좋아요 생성
    public Like saveLike(Like like) {
        // 좋아요 정보 저장
        return likeRepository.save(like);
    }
}