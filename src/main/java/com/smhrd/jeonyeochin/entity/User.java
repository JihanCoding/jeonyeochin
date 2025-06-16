package com.smhrd.jeonyeochin.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tb_user")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId; // 사용자 ID

    @Column(name = "user_nick", nullable = false, length = 255)
    private String userNick; // 사용자 닉네임

    @Column(name = "user_name", nullable = false, length = 255)
    private String userName; // 사용자 이름

    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail; // 사용자 이메일

    @Column(name = "user_password", nullable = false, length = 255)
    private String userPassword; // 사용자 비밀번호

    @Column(name = "user_profile", nullable = true, length = 255)
    private String userProfile; // 사용자 프로필 사진 URL

    @Column(name = "user_birth", nullable = false, length = 255)
    private String userBirth; // 사용자 생년월일 

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // 사용자 생성 시간
}