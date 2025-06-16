package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.Comment;
import com.smhrd.jeonyeochin.entity.User;
import com.smhrd.jeonyeochin.repository.CommentRepository;
import com.smhrd.jeonyeochin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@Transactional
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserRepository userRepository;

    // 댓글 생성
    public Comment saveComment(Comment comment) {
        // 댓글 정보 저장
        return commentRepository.save(comment);
    }

    // 댓글 수정
    public Comment updateComment(Integer commentId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        comment.setCommentContent(content);
        comment.setUpdatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(comment);
    }

    // 게시글의 댓글 목록 + 닉네임 반환
    public List<Map<String, Object>> getCommentsWithNickByPostId(Integer postId) {
        List<Comment> comments = commentRepository.findAllByPostId(postId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Comment c : comments) {
            User user = userRepository.findById(c.getUserId()).orElse(null);
            String userNick = (user != null) ? user.getUserNick() : "알수없음";
            Map<String, Object> map = new HashMap<>();
            map.put("comment", c);
            map.put("userNick", userNick);
            result.add(map);
        }
        return result;
    }

    // 페이징 처리된 댓글 + 닉네임 반환
    public Page<Map<String, Object>> getCommentsWithNickByPostIdPaged(Integer postId, Pageable pageable) {
        Page<Comment> commentPage = commentRepository.findAllByPostId(postId, pageable);
        return commentPage.map(c -> {
            User user = userRepository.findById(c.getUserId()).orElse(null);
            String userNick = (user != null) ? user.getUserNick() : "알수없음";
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("comment", c);
            map.put("userNick", userNick);
            return map;
        });
    }
}