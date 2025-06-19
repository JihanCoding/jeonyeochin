package com.smhrd.jeonyeochin.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.dto.postDto;
import com.smhrd.jeonyeochin.entity.Post;
import com.smhrd.jeonyeochin.repository.PostRepository;

@Service
@Transactional
public class PostService {

    @Autowired
    private PostRepository postRepository;

    /**
     * 게시글 저장 (DTO → 엔티티 매핑 + 다중 이미지 파일 저장)
     */
    public Post savePost(postDto form) throws Exception {
        // 1) 업로드 디렉터리 준비
        String projectDir = System.getProperty("user.dir");
        Path uploadDir = Paths.get(
                projectDir,
                "src", "main", "resources", "static", "common");
        Files.createDirectories(uploadDir);

        // 2) 이미지 안전 처리
        List<MultipartFile> images = form.getPostImage();
        if (images == null) {
            images = List.of();
        }

        // 3) 파일 저장 → 파일명 수집
        List<String> savedFileNames = images.stream()
                .filter(f -> !f.isEmpty())
                .map(f -> {
                    try {
                        String fn = System.currentTimeMillis() + "_" + f.getOriginalFilename();
                        Path target = uploadDir.resolve(fn);
                        f.transferTo(target.toFile());
                        return fn;
                    } catch (Exception e) {
                        throw new RuntimeException("파일 저장 실패: " + e.getMessage(), e);
                    }
                })
                .collect(Collectors.toList());

        // 4) 날짜 파싱 (OffsetDateTime → LocalDateTime)
        OffsetDateTime odt = OffsetDateTime.parse(form.getPostCreatedAt());
        LocalDateTime createdAt = odt
                .atZoneSameInstant(ZoneId.of("Asia/Seoul"))
                .toLocalDateTime();

        // 3) DTO → 엔티티 매핑
        Post post = new Post();
        post.setUserId(form.getUserId());
        post.setPostAuthor(form.getPostAuthor());
        post.setPostTitle(form.getPostTitle());
        post.setPostCategory(form.getPostCategory());
        post.setPostTag(form.getPostTag()); // 태그 CSV
        post.setPostImage(String.join(",", savedFileNames)); // 이미지 파일명 CSV
        post.setPostContent(form.getPostContent());
        post.setPostCreatedAt(createdAt);
        post.setPostLatitude(form.getPostLatitude());
        post.setPostLongitude(form.getPostLongitude());

        // 4) DB 저장
        return postRepository.save(post);
    }

    /**
     * 게시글 수정 (본인만 가능)
     */
    public Post updatePost(Integer postId, Post updateData, Integer userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!post.getUserId().equals(userId)) {
            throw new SecurityException("본인 게시글만 수정할 수 있습니다.");
        }

        post.setPostTitle(updateData.getPostTitle());
        post.setPostContent(updateData.getPostContent());
        post.setPostCategory(updateData.getPostCategory());
        post.setPostTag(updateData.getPostTag());
        post.setPostImage(updateData.getPostImage());
        post.setPostLatitude(updateData.getPostLatitude());
        post.setPostLongitude(updateData.getPostLongitude());

        return postRepository.save(post);
    }

    /**
     * 특정 사용자의 페이징된 게시글 목록 조회
     */
    public org.springframework.data.domain.Page<Post> getPostsByUserId(
            Integer userId,
            org.springframework.data.domain.Pageable pageable) {
        return postRepository.findAllByUserId(userId, pageable);
    }

    /**
     * 특정 사용자의 전체 게시글 목록 조회
     */
    public List<Post> getPostsByUserId(Integer userId) {
        return postRepository.findByUserId(userId);
    }

    /**
     * 모든 게시글 조회 (지도 마커용)
     */
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }
}
