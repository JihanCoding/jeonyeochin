package com.smhrd.jeonyeochin.entity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "tb_info")
@Data
public class Info {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "info_id")
    private Integer infoId;

    @Column(name = "info_latitude", nullable = false)
    private Double infoLatitude;

    @Column(name = "info_longitude", nullable = false)
    private Double infoLongitude;

    @Column(name = "info_category", nullable = false, length = 100)
    private String infoCategory;

    @Column(name = "info_title", nullable = false, length = 255)
    private String infoTitle;

    @Column(name = "info_content", length = 1000, nullable = true)
    private String infoContent;

    @Column(name = "info_images", length = 1000, nullable = true)
    private String infoImages;

    @Column(name = "info_event_start_date", nullable = false)
    private String infoEventStartDate;

    @Column(name = "info_event_start_time", nullable = false)
    private String infoEventStartTime;

    @Column(name = "info_event_end_date", nullable = false)
    private String infoEventEndDate;

    @Column(name = "info_event_end_time", nullable = false)
    private String infoEventEndTime;
}