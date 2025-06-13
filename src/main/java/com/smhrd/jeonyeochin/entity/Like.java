package com.smhrd.jeonyeochin.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_like")
@Data
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Integer likeId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "post_id", nullable = false)
    private Integer postId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
