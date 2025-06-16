package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.User;
import com.smhrd.jeonyeochin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 로그인
    public User login(String userEmail, String userPassword) {
        return userRepository.findByUserEmail(userEmail)
                .filter(user -> passwordEncoder.matches(userPassword, user.getUserPassword()))
                .orElse(null);
    }

    // 회원가입
    public User saveUser(User user) {
        // 비밀번호 암호화 적용
        String encodedPassword = passwordEncoder.encode(user.getUserPassword());
        user.setUserPassword(encodedPassword);
        return userRepository.save(user);
    }

    // 이메일 중복 확인
    public boolean isEmailExists(String userEmail) {
        return userRepository.existsByUserEmail(userEmail);
    }

    // 닉네임 중복 확인
    public boolean isNickExists(String userNick) {
        return userRepository.existsByUserNick(userNick);
    }

    // userId로 유저 정보 조회
    public User getUserById(Integer userId) {
        return userRepository.findById(userId).orElse(null);
    }

    // userNick 변경
    public boolean updateNickname(Integer userId, String userNick) {
        User user = getUserById(userId);
        if (user != null) {
            user.setUserNick(userNick);
            userRepository.save(user);
            return true;
        }
        return false;
    }
}