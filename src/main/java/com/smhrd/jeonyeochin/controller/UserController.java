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
                "user", savedUser
            ));
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
            return ResponseEntity.ok(Map.of("user", user));
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "이메일 또는 비밀번호가 올바르지 않습니다."));
        }
    }
}