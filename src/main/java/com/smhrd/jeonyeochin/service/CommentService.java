package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.Comment;
import com.smhrd.jeonyeochin.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;

    // 좋아요 생성
    public Comment saveComment(Comment comment) {
        // 좋아요 정보 저장
        return commentRepository.save(comment);
    }
}