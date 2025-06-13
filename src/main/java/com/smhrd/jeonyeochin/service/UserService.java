package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.User;
import com.smhrd.jeonyeochin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    
    // 로그인
    
    // 회원가입
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}