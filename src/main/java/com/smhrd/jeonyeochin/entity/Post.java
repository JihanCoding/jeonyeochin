package com.smhrd.jeonyeochin.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_post")
@Data
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Integer postId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "post_author", nullable = false, length = 100)
    private String postAuthor;

    @Column(name = "post_title", nullable = false, length = 255)
    private String postTitle;

    @Column(name = "post_category", nullable = false, length = 100)
    private String postCategory;

    @Column(name = "post_tag", nullable = false, length = 255)
    private String postTag;

    @Column(name = "post_image", nullable = false, length = 1000)
    private String postImage;

    @Column(name = "post_content", nullable = false, length = 2000)
    private String postContent;

    @Column(name = "post_created_at", nullable = false)
    private LocalDateTime postCreatedAt;

    @Column(name = "post_latitude", nullable = false)
    private Double postLatitude;

    @Column(name = "post_longitude", nullable = false)
    private Double postLongitude;
}
