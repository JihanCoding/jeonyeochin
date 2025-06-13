package com.smhrd.jeonyeochin.controller;

import com.smhrd.jeonyeochin.entity.Post;
import com.smhrd.jeonyeochin.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/post")
@CrossOrigin(origins = "*")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    // 게시글 생성~!@!!
    @RequestMapping("/create")
    public ResponseEntity<?> create(@RequestBody Post postData) {
        try {
            // 게시글 처리
            Post savedPost = postService.savePost(postData);
            
            // 게시글 반환!!
            return ResponseEntity.ok(Map.of(
                "post", savedPost
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}