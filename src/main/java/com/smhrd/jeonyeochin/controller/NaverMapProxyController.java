package com.smhrd.jeonyeochin.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class NaverMapProxyController {
    @GetMapping("/api/naver-reversegeocode")
    public ResponseEntity<String> reverseGeocode(@RequestParam double lat, @RequestParam double lng) {
        String apiUrl = "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=" + lng + "," + lat + "&orders=roadaddr,addr&output=json";
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-NCP-APIGW-API-KEY-ID", "e696ij4ub6");
        headers.set("X-NCP-APIGW-API-KEY", "VE4dq3vAamH8MibpCpjxskfG1l8MbSrUcJBk9Qzz");
        HttpEntity<String> entity = new HttpEntity<>(headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);
        return response;
    }
}
