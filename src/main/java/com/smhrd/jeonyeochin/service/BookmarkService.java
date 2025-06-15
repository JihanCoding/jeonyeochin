package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.Bookmark;
import com.smhrd.jeonyeochin.repository.BookmarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class BookmarkService {
    
    @Autowired
    private BookmarkRepository bookmarkRepository;

    // 북마크 생성
    public Bookmark saveBookmark(Bookmark bookmark) {
        // 북마크 정보 저장
        return bookmarkRepository.save(bookmark);
    }
}