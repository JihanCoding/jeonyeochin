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
@Table(name = "tb_like")
@Data
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Integer likeId; // 좋아요 ID

    @Column(name = "user_id", nullable = false)
    private Integer userId; // 사용자 ID

    @Column(name = "post_id", nullable = false)
    private Integer postId; // 게시글 ID

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // 좋아요 생성 시간
}
