package com.smhrd.jeonyeochin.controller;
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
    
    // 좋아요 토글(추가/취소)
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleLike(@RequestParam Integer userId, @RequestParam Integer postId) {
        try {
            boolean liked = likeService.toggleLike(userId, postId);
            return ResponseEntity.ok(Map.of(
                "result",Map.of(
                    "liked", liked,
                    "message", liked ? "좋아요 추가됨" : "좋아요 취소됨"
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 게시글별 좋아요 개수 반환
    @GetMapping("/count/{postId}")
    public ResponseEntity<?> countLikes(@PathVariable Integer postId) {
        int count = likeService.countLikesByPostId(postId);
        return ResponseEntity.ok(Map.of(
            "result", count
        ));
    }
}