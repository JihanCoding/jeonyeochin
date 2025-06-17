package com.smhrd.jeonyeochin.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.jeonyeochin.entity.Info;
import com.smhrd.jeonyeochin.service.InfoService;

@RestController
@RequestMapping("/api/info")
@CrossOrigin(origins = "*")
public class InfoController {

    @Autowired
    private InfoService infoService;

    // 정보 생성~!~
    @RequestMapping("/create")
    public ResponseEntity<?> create(@RequestBody Info infoData) {
        try {
            // 정보 처리~!!!
            Info savedInfo = infoService.saveInfo(infoData);

            // 정보 반환
            return ResponseEntity.ok(Map.of(
                    "result", savedInfo
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 전체 마커(축제, 공연, 관광, 테마파크 등) 리스트 조회 API
    @GetMapping("/list")
    public ResponseEntity<?> getAllInfo() {
        try {
            return ResponseEntity.ok(Map.of(
                "result",infoService.findAll()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}