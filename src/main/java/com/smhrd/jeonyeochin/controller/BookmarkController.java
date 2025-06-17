package com.smhrd.jeonyeochin.controller;
import com.smhrd.jeonyeochin.entity.Bookmark;
import com.smhrd.jeonyeochin.service.BookmarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/bookmark")
@CrossOrigin(origins = "*")
public class BookmarkController {
    
    @Autowired
    private BookmarkService bookmarkService;
    
    // 북마크 생성~
    @RequestMapping("/create")
    public ResponseEntity<?> create(@RequestBody Bookmark bookmarkData) {
        try {
            // 북마크 처리
            Bookmark savedBookmark = bookmarkService.saveBookmark(bookmarkData);
            
            // 북마크 반환
            return ResponseEntity.ok(Map.of(
                "result", savedBookmark
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}