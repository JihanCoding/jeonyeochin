package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.Post;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
}