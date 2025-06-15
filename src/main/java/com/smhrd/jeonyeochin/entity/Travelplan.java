package com.smhrd.jeonyeochin.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tb_travelplan")
@Data
public class Travelplan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "travelplan_id")
    private Integer travelplanId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "travelplan_title", nullable = false, length = 255)
    private String travelplanTitle;

    @Column(name = "travelplan_content", nullable = false, length = 2000)
    private String travelplanContent;

    @Column(name = "travelplan_startdate", nullable = false, length = 20)
    private String travelplanStartdate;

    @Column(name = "travelplan_enddate", nullable = false, length = 20)
    private String travelplanEnddate;

    @Column(name = "travelplan_departure", nullable = false, length = 255)
    private String travelplanDeparture;

    @Column(name = "travelplan_destination", nullable = false, length = 255)
    private String travelplanDestination;

    @Column(name = "travelplan_layover", nullable = false, length = 255)
    private String travelplanLayover;
}
