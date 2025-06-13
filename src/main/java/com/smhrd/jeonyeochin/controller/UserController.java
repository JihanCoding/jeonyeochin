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
    

}