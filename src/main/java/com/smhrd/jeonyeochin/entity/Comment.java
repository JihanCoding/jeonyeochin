package com.smhrd.jeonyeochin.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_comment")
@Data
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Integer commentId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "post_id", nullable = false)
    private Integer postId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "comment_content", nullable = false, length = 1000)
    private String commentContent;
}
