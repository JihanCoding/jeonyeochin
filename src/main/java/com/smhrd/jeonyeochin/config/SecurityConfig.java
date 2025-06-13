package com.smhrd.jeonyeochin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())    // 기본 로그인 폼 제거
            .httpBasic(basic -> basic.disable())  // Basic 인증 제거
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // 모두 허용

        return http.build();
    }
}

