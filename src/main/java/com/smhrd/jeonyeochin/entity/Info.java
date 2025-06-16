package com.smhrd.jeonyeochin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tb_info")
@Data
public class Info {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "info_id")
    private Integer infoId; // 정보 ID

    @Column(name = "info_latitude", nullable = false)
    private Double infoLatitude; // 위도

    @Column(name = "info_longitude", nullable = false)
    private Double infoLongitude; // 경도

    @Column(name = "info_category", nullable = false, length = 100)
    private String infoCategory; // 카테고리

    @Column(name = "info_title", nullable = false, length = 255)
    private String infoTitle; // 제목

    @Column(name = "info_content", length = 1000, nullable = true)
    private String infoContent; // 내용

    @Column(name = "info_images", length = 1000, nullable = true)
    private String infoImages; // 이미지 URL

    @Column(name = "info_event_start_date", nullable = true)
    private String infoEventStartDate; // 이벤트 시작 날짜

    @Column(name = "info_event_start_time", nullable = true)
    private String infoEventStartTime; // 이벤트 시작 시간

    @Column(name = "info_event_end_date", nullable = true)
    private String infoEventEndDate; // 이벤트 종료 날짜

    @Column(name = "info_event_end_time", nullable = true)
    private String infoEventEndTime; // 이벤트 종료 시간

    @Column(name = "info_address", nullable = true)
    private String infoAddress; // 주소
}