package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.Post;
import com.smhrd.jeonyeochin.repository.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class PostService {
    
    @Autowired
    private PostRepository postRepository;

    // 게시글 생성
    public Post savePost(Post post) {
        // 게시글 정보 저장
        return postRepository.save(post);
    }
}