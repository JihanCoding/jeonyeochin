package com.smhrd.jeonyeochin.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
            java.util.List<Info> infoList = infoService.findAll();
            // infoImages에 경로를 붙여서 반환
            infoList.forEach(info -> {
                if (info.getInfoImages() != null && !info.getInfoImages().startsWith("/common/")) {
                    info.setInfoImages("/common/" + info.getInfoImages());
                }
            });
            return ResponseEntity.ok(Map.of(
                "result", infoList
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 특정 마커(정보) 상세 조회 API
    @GetMapping("/{infoId}")
    public ResponseEntity<?> getInfoById(@PathVariable Integer infoId) {
        try {
            Info info = infoService.findById(infoId);
            if (info != null) {
                return ResponseEntity.ok(Map.of(
                    "result", info
                ));
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "정보를 찾을 수 없습니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 카테고리별 정보 리스트 조회
    @GetMapping("/category")
    public ResponseEntity<?> getInfoByCategory(@RequestParam String infoCategory) {
        try {
            return ResponseEntity.ok(Map.of(
                "result", infoService.findByCategory(infoCategory)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 위치(위도/경도 범위) 내 정보 리스트 조회
    @GetMapping("/location")
    public ResponseEntity<?> getInfoByLocation(@RequestParam Double minLat, @RequestParam Double maxLat,
                                               @RequestParam Double minLng, @RequestParam Double maxLng) {
        try {
            return ResponseEntity.ok(Map.of(
                "result", infoService.findByLocation(minLat, maxLat, minLng, maxLng)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 카테고리+위치 동시 필터링
    @GetMapping("/filter")
    public ResponseEntity<?> getInfoByCategoryAndLocation(@RequestParam String infoCategory,
                                                          @RequestParam Double minLat, @RequestParam Double maxLat,
                                                          @RequestParam Double minLng, @RequestParam Double maxLng) {
        try {
            return ResponseEntity.ok(Map.of(
                "result", infoService.findByCategoryAndLocation(infoCategory, minLat, maxLat, minLng, maxLng)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}