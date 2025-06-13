package com.smhrd.jeonyeochin.controller;

import com.smhrd.jeonyeochin.entity.Info;
import com.smhrd.jeonyeochin.service.InfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


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
                "info", savedInfo
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}