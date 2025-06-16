package com.smhrd.jeonyeochin.controller;
import com.smhrd.jeonyeochin.entity.Travelplan;
import com.smhrd.jeonyeochin.service.TravelplanService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/travelplan")
@CrossOrigin(origins = "*")
public class TravelplanController {
    
    @Autowired
    private TravelplanService travelplanService;
    
    // 여행계획 생성~
    @RequestMapping("/create")
    public ResponseEntity<?> create(@RequestBody Travelplan travelplanData) {
        try {
            // 여행계획 처리
            Travelplan savedTravelplan = travelplanService.saveTravelplan(travelplanData);
            
            // 여행계획 반환
            return ResponseEntity.ok(Map.of(
                "travelplan", savedTravelplan
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    // 특정 사용자의 여행계획 목록 조회
    @GetMapping("/list")
    public ResponseEntity<?> getTravelplansByUserId(@RequestParam Integer userId) {
        try {
            java.util.List<Travelplan> plans = travelplanService.getTravelplansByUserId(userId);
            return ResponseEntity.ok(Map.of("travelplans", plans));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 여행계획 상세 조회
    @GetMapping("/{planId}")
    public ResponseEntity<?> getTravelplanById(@PathVariable Integer planId) {
        Travelplan plan = travelplanService.getTravelplanById(planId);
        if (plan != null) {
            return ResponseEntity.ok(Map.of("travelplan", plan));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "여행계획을 찾을 수 없습니다."));
        }
    }
}