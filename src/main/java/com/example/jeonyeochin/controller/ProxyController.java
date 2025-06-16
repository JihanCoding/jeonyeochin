package com.example.jeonyeochin.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/proxy")
@CrossOrigin // 필요시 CORS 허용
public class ProxyController {

    @GetMapping
    public ResponseEntity<String> proxy(@RequestParam String url) {
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Proxy fetch failed: " + e.getMessage());
        }
    }
}
