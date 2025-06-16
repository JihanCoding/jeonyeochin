package com.smhrd.jeonyeochin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10초 연결 타임아웃
        factory.setReadTimeout(30000); // 30초 읽기 타임아웃

        RestTemplate restTemplate = new RestTemplate(factory);

        // 예외 처리 개선
        restTemplate.setErrorHandler(new org.springframework.web.client.DefaultResponseErrorHandler() {
            @Override
            public boolean hasError(org.springframework.http.client.ClientHttpResponse response)
                    throws java.io.IOException {
                return response.getStatusCode().is4xxClientError() || response.getStatusCode().is5xxServerError();
            }
        });

        return restTemplate;
    }
}
