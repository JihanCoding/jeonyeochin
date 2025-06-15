package com.smhrd.jeonyeochin.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tb_bookmark")
@Data
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookmark_id")
    private Integer bookmarkId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "post_id", nullable = false)
    private Integer postId;

}
