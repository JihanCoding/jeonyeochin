package com.smhrd.jeonyeochin.controller;

import com.smhrd.jeonyeochin.entity.User;
import com.smhrd.jeonyeochin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User userData) {
        try {
            // 회원가입 처리
            User savedUser = userService.saveUser(userData);

            // 사용자 정보만 반환
            return ResponseEntity.ok(Map.of(
                    "result", savedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String userEmail = loginData.get("userEmail");
        String userPassword = loginData.get("userPassword");
        User user = userService.login(userEmail, userPassword);
        if (user != null) {
            return ResponseEntity.ok(Map.of("result", user));
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "이메일 또는 비밀번호가 올바르지 않습니다."));
        }
    }

    // 이메일 중복 확인
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String userEmail) {
        boolean exists = userService.isEmailExists(userEmail);
        return ResponseEntity.ok(Map.of(
            "result", exists
        ));
    }

    // 닉네임 중복 확인
    @GetMapping("/check-nick")
    public ResponseEntity<?> checkNick(@RequestParam String userNick) {
        boolean exists = userService.isNickExists(userNick);
        return ResponseEntity.ok(Map.of(
            "result", exists
        ));
    }

    // userId로 유저 정보 조회
    @GetMapping("/info/{userId}")
    public ResponseEntity<?> getUserInfo(@PathVariable Integer userId) {
        User user = userService.getUserById(userId);
        if (user != null) {
            return ResponseEntity.ok(Map.of(
                "result", user
            ));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "사용자를 찾을 수 없습니다."));
        }
    }

    // userNick 변경
    @PostMapping("/update")
    public ResponseEntity<?> updateNickname(@RequestBody Map<String, Object> data) {
        Integer userId = ((Number) data.get("userId")).intValue();
        String userNick = (String) data.get("userNick");
        boolean result = userService.updateNickname(userId, userNick);
        if (result) {
            return ResponseEntity.ok(Map.of("result", result));
        } else {
            return ResponseEntity.status(404).body("사용자 없음");
        }
    }
}