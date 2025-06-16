package com.smhrd.jeonyeochin.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tb_post")
@Data
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Integer postId; // 게시글 ID

    @Column(name = "user_id", nullable = false)
    private Integer userId; // 사용자 ID

    @Column(name = "post_author", nullable = false, length = 100)
    private String postAuthor; // 게시글 작성자

    @Column(name = "post_title", nullable = false, length = 255)
    private String postTitle; // 게시글 제목

    @Column(name = "post_category", nullable = false, length = 100)
    private String postCategory; // 게시글 카테고리

    @Column(name = "post_tag", nullable = false, length = 255)
    private String postTag; // 게시글 태그

    @Column(name = "post_image", nullable = false, length = 1000)
    private String postImage; // 게시글 이미지 URL

    @Column(name = "post_content", nullable = false, length = 2000)
    private String postContent; // 게시글 내용

    @Column(name = "post_created_at", nullable = false)
    private LocalDateTime postCreatedAt; // 게시글 작성 시간

    @Column(name = "post_latitude", nullable = false)
    private Double postLatitude; // 게시글 위도

    @Column(name = "post_longitude", nullable = false)
    private Double postLongitude; // 게시글 경도
}
