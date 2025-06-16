package com.smhrd.jeonyeochin.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/geocoding")
@CrossOrigin(origins = "*")
public class GeocodingController {

    private final RestTemplate restTemplate;

    public GeocodingController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/reverse")
    public ResponseEntity<String> reverseGeocoding(
            @RequestParam double lat,
            @RequestParam double lng) {

        try {
            System.out.println("역지오코딩 요청 - 위도: " + lat + ", 경도: " + lng);

            // 카카오맵 역지오코딩 API 사용 (REST API 키 필요 없는 버전)
            String url = String.format(
                    "https://dapi.kakao.com/v2/local/geo/coord2address.json?x=%f&y=%f",
                    lng, lat);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK YOUR_KAKAO_REST_API_KEY"); // 실제 키로 교체 필요
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            System.out.println("카카오맵 API 응답: " + response.getStatusCode());

            return ResponseEntity.ok()
                    .header("Access-Control-Allow-Origin", "*")
                    .body(response.getBody());

        } catch (Exception e) {
            System.err.println("역지오코딩 오류: " + e.getMessage());

            // 카카오 API 실패 시 대체 방법 (OpenStreetMap Nominatim)
            return fallbackReverseGeocoding(lat, lng);
        }
    }

    @GetMapping("/reverse/nominatim")
    public ResponseEntity<String> fallbackReverseGeocoding(
            @RequestParam double lat,
            @RequestParam double lng) {

        try {
            System.out.println("Nominatim 역지오코딩 요청 - 위도: " + lat + ", 경도: " + lng);

            // OpenStreetMap Nominatim API 사용 (무료, 키 불필요)
            String url = String.format(
                    "https://nominatim.openstreetmap.org/reverse?format=json&lat=%f&lon=%f&accept-language=ko",
                    lat, lng);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "jeonyeochin-app/1.0");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            System.out.println("Nominatim API 응답: " + response.getStatusCode());

            return ResponseEntity.ok()
                    .header("Access-Control-Allow-Origin", "*")
                    .body(response.getBody());

        } catch (Exception e) {
            System.err.println("Nominatim 역지오코딩 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body("{\"error\": \"역지오코딩 서비스를 사용할 수 없습니다.\", \"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("{\"message\": \"지오코딩 컨트롤러가 정상적으로 작동합니다.\"}");
    }
}
