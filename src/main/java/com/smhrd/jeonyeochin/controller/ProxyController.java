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
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProxyController {

    private final RestTemplate restTemplate;

    public ProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/proxy")
    public ResponseEntity<String> proxy(@RequestParam String url) {
        System.out.println("=== 프록시 요청 시작 ===");
        System.out.println("요청된 URL: " + url);

        try {
            // URL 유효성 검사
            if (url == null || url.trim().isEmpty()) {
                System.out.println("에러: URL 파라미터가 비어있음");
                return ResponseEntity.badRequest()
                        .body("{\"error\": \"URL 파라미터가 필요합니다.\"}");
            }

            // RestTemplate null 체크
            if (restTemplate == null) {
                System.err.println("에러: RestTemplate이 null입니다!");
                return ResponseEntity.status(500)
                        .body("{\"error\": \"RestTemplate 초기화 실패\"}");
            }

            System.out.println("프록시 요청 URL: " + url);

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.set("Accept", "application/json, text/plain, */*");
            headers.set("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            System.out.println("외부 API 호출 시작...");

            // 외부 API 호출
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class);

            System.out.println("프록시 응답 상태: " + response.getStatusCode());
            System.out.println("응답 본문 길이: " + (response.getBody() != null ? response.getBody().length() : 0));

            // CORS 헤더 설정
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set("Access-Control-Allow-Origin", "*");
            responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            responseHeaders.set("Access-Control-Allow-Headers", "*");

            System.out.println("=== 프록시 요청 성공 ===");

            return ResponseEntity.ok()
                    .headers(responseHeaders)
                    .body(response.getBody());

        } catch (RestClientException e) {
            System.err.println("RestClient 오류: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("{\"error\": \"프록시 요청 실패\", \"message\": \"" + e.getMessage() + "\", \"type\": \""
                            + e.getClass().getSimpleName() + "\"}");
        } catch (Exception e) {
            System.err.println("일반 오류: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("{\"error\": \"서버 오류\", \"message\": \"" + e.getMessage() + "\", \"type\": \""
                            + e.getClass().getSimpleName() + "\"}");
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity
                .ok("{\"message\": \"프록시 컨트롤러 테스트 성공\", \"timestamp\": " + System.currentTimeMillis() + "}");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\": \"UP\", \"timestamp\": " + System.currentTimeMillis() + "}");
    }
}