package com.smhrd.jeonyeochin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tb_bookmark")
@Data
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookmark_id")
    private Integer bookmarkId; // 북마크 ID

    @Column(name = "user_id", nullable = false)
    private Integer userId; // 사용자 ID

    @Column(name = "post_id", nullable = false)
    private Integer postId; // 게시글 ID

}
