package com.smhrd.jeonyeochin.controller;

import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();

        try {
            status.put("status", "UP");
            status.put("timestamp", System.currentTimeMillis());

            // 데이터베이스 연결 확인
            try (Connection connection = dataSource.getConnection()) {
                status.put("database", "UP");
                status.put("database_url", connection.getMetaData().getURL());
            } catch (Exception e) {
                status.put("database", "DOWN");
                status.put("database_error", e.getMessage());
            }

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            status.put("status", "DOWN");
            status.put("error", e.getMessage());
            return ResponseEntity.status(500).body(status);
        }
    }
}
