package com.smhrd.jeonyeochin.controller;
import com.smhrd.jeonyeochin.entity.Comment;
import com.smhrd.jeonyeochin.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/comment")
@CrossOrigin(origins = "*")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    // 댓글 생성~
    @RequestMapping("/create")
    public ResponseEntity<?> create(@RequestBody Comment commentData) {
        try {
            // 댓글 처리
            Comment savedComment = commentService.saveComment(commentData);
            
            // 댓글 반환
            return ResponseEntity.ok(Map.of(
                "comment", savedComment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}