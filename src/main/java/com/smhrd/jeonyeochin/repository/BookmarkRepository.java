package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.Bookmark;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Integer> {
}