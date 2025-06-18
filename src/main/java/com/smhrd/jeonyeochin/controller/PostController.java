package com.smhrd.jeonyeochin.controller;

import com.smhrd.dto.postDto;
import com.smhrd.jeonyeochin.entity.Post;
import com.smhrd.jeonyeochin.service.PostService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/post")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostService postService;

    // 게시글 생성~!@!!
    // @RequestMapping("/create")
    // public ResponseEntity<?> create(@RequestBody postDto postData) {
    // try {
    // // 게시글 처리
    // Post savedPost = postService.savePost(postData);

    // // 게시글 반환!!
    // return ResponseEntity.ok(Map.of(
    // "result", savedPost));
    // } catch (Exception e) {
    // return ResponseEntity.badRequest()
    // .body(Map.of("error", e.getMessage()));
    // }
    // }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(@ModelAttribute postDto form) {
        try {
            // 넘겨받은 formDto 안에 List<MultipartFile> postImage 가 들어 있음
            System.out.println("size"+ form.getPostImage().size());
            System.out.println("Received post data: " + form.getPostImage());
            Post saved = postService.savePost(form);
            return ResponseEntity.ok(Map.of("id", saved.getPostId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 게시글 수정 (본인만 가능)
    @PutMapping("/update/{postId}")
    public ResponseEntity<?> updatePost(@PathVariable Integer postId,
            @RequestBody Post updateData,
            @RequestParam Integer userId) {
        try {
            // 1. 서비스의 updatePost 메서드 호출 (게시글 ID, 수정할 데이터, 로그인한 유저 ID 전달)
            Post updatedPost = postService.updatePost(postId, updateData, userId);
            // 2. 수정된 게시글을 응답으로 반환
            return ResponseEntity.ok(Map.of(
                    "result", updatedPost));
        } catch (SecurityException e) {
            // 3. 본인 게시글이 아닐 경우 403(권한 없음) 에러 반환
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // 4. 그 외의 예외는 400(Bad Request)로 반환
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("list/{userId}")
    public ResponseEntity<?> getMyPosts(@PathVariable Integer userId) {
        try {
            List<Post> post = postService.getPostsByUserId(userId);
            return ResponseEntity.ok(Map.of("result", post));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "서버오류"));
        }
    }
}
