package com.smhrd.jeonyeochin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.dto.postDto;
import com.smhrd.jeonyeochin.entity.Post;
import com.smhrd.jeonyeochin.service.PostService;

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
    // }    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(@ModelAttribute postDto form) {
        try {
            System.out.println("=== 게시글 생성 요청 수신 ===");
            System.out.println("UserId: " + form.getUserId());
            System.out.println("PostAuthor: " + form.getPostAuthor());
            System.out.println("PostTitle: " + form.getPostTitle());
            System.out.println("PostCategory: " + form.getPostCategory());
            System.out.println("PostContent: " + form.getPostContent());
            System.out.println("PostLatitude: " + form.getPostLatitude());
            System.out.println("PostLongitude: " + form.getPostLongitude());
            System.out.println("Image files count: " + (form.getPostImage() != null ? form.getPostImage().size() : 0));
            
            // 넘겨받은 formDto 안에 List<MultipartFile> postImage 가 들어 있음
            Post saved = postService.savePost(form);
            System.out.println("게시글 저장 성공 - ID: " + saved.getPostId());
            
            return ResponseEntity.ok(Map.of("id", saved.getPostId(), "message", "게시글이 성공적으로 생성되었습니다."));
        } catch (Exception e) {
            System.err.println("게시글 생성 중 오류 발생:");
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
    } // 모든 게시글 조회 (지도 마커용)

    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts() {
        try {
            List<Post> posts = postService.getAllPosts();
            return ResponseEntity.ok(Map.of("result", posts));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "서버오류"));
        }
    }
}
