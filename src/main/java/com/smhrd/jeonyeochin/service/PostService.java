package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.Post;
import com.smhrd.jeonyeochin.repository.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class PostService {
    
    @Autowired
    private PostRepository postRepository;

    // 게시글 생성
    public Post savePost(Post post) {
        // 게시글 정보 저장
        return postRepository.save(post);
    }

    // 게시글 수정 (본인만 가능)
    public Post updatePost(Integer postId, Post updateData, Integer userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        if (!post.getUserId().equals(userId)) {
            throw new SecurityException("본인 게시글만 수정할 수 있습니다.");
        }
        // 수정 가능한 필드만 변경
        post.setPostTitle(updateData.getPostTitle());
        post.setPostContent(updateData.getPostContent());
        post.setPostCategory(updateData.getPostCategory());
        post.setPostTag(updateData.getPostTag());
        post.setPostImage(updateData.getPostImage());
        post.setPostLatitude(updateData.getPostLatitude());
        post.setPostLongitude(updateData.getPostLongitude());
        // 필요시 post.setPostAuthor 등 추가
        return postRepository.save(post);
    }
}