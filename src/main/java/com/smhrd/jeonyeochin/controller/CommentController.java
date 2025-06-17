package com.smhrd.jeonyeochin.controller;
import com.smhrd.jeonyeochin.entity.Comment;
import com.smhrd.jeonyeochin.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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
                "result", savedComment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    // 게시글의 댓글 목록 + 닉네임 반환
    @GetMapping("/list/{postId}")
    public ResponseEntity<?> getCommentsWithNick(@PathVariable Integer postId) {
        try {
            List<Map<String, Object>> comments = commentService.getCommentsWithNickByPostId(postId);
            return ResponseEntity.ok(Map.of(
                "result",comments
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 페이징 처리된 댓글 + 닉네임 반환
    @GetMapping("/list/paged/{postId}")
    public ResponseEntity<?> getCommentsWithNickPaged(
            @PathVariable Integer postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Map<String, Object>> commentPage = commentService.getCommentsWithNickByPostIdPaged(postId, pageable);
            return ResponseEntity.ok(Map.of(
                "result",commentPage
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}