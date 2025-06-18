package com.smhrd.dto;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class postDto {
    private int    userId;
    private String  postAuthor;
    private String  postTitle;
    private String  postCategory;
    private String  postTag;         // JSON.stringify(selectedTags)
    private String  postContent;
    private String  postCreatedAt;   // ISO 문자열
    private Double  postLatitude;
    private Double  postLongitude;   // coords.lng 자리
    private List<MultipartFile> postImage;
}
