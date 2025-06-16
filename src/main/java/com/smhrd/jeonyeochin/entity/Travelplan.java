package com.smhrd.jeonyeochin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tb_travelplan")
@Data
public class Travelplan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "travelplan_id")
    private Integer travelplanId; // 여행 계획 ID

    @Column(name = "user_id", nullable = false)
    private Integer userId; // 사용자 ID

    @Column(name = "travelplan_title", nullable = false, length = 255)
    private String travelplanTitle; // 여행 계획 제목

    @Column(name = "travelplan_content", nullable = false, length = 2000)
    private String travelplanContent; // 여행 계획 내용

    @Column(name = "travelplan_startdate", nullable = false, length = 20)
    private String travelplanStartdate; // 여행 계획 시작 날짜

    @Column(name = "travelplan_enddate", nullable = false, length = 20)
    private String travelplanEnddate; // 여행 계획 종료 날짜

    @Column(name = "travelplan_departure", nullable = false, length = 255)
    private String travelplanDeparture; // 여행 계획 출발지

    @Column(name = "travelplan_destination", nullable = false, length = 255)
    private String travelplanDestination; // 여행 계획 목적지

    @Column(name = "travelplan_layover", nullable = true, length = 255)
    private String travelplanLayover; // 여행 계획 경유지
}
