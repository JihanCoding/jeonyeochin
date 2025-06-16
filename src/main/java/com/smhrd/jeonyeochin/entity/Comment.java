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
@Table(name = "tb_comment")
@Data
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Integer commentId; // 댓글 ID

    @Column(name = "user_id", nullable = false)
    private Integer userId; // 사용자 ID

    @Column(name = "post_id", nullable = false)
    private Integer postId; // 게시글 ID

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // 댓글 작성 시간

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 댓글 수정 시간

    @Column(name = "comment_content", nullable = false, length = 1000)
    private String commentContent; // 댓글 내용
}
