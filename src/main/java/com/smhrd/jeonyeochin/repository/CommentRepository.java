package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.Comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    // 게시글 ID로 댓글 전체 조회
    List<Comment> findAllByPostId(Integer postId);

    // 게시글 ID로 댓글 페이징 조회
    Page<Comment> findAllByPostId(Integer postId, Pageable pageable);
}