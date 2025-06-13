package com.smhrd.jeonyeochin.controller;
import com.smhrd.jeonyeochin.entity.Like;
import com.smhrd.jeonyeochin.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/like")
@CrossOrigin(origins = "*")
public class LikeController {
    
    @Autowired
    private LikeService likeService;
    
    // 좋아요 생성~
    @RequestMapping("/create")
    public ResponseEntity<?> create(@RequestBody Like likeData) {
        try {
            // 좋아요 처리
            Like savedLike = likeService.saveLike(likeData);
            
            // 좋아요 반환
            return ResponseEntity.ok(Map.of(
                "like", savedLike
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}