package com.smhrd.jeonyeochin.repository;

import com.smhrd.jeonyeochin.entity.Info;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InfoRepository extends JpaRepository<Info, Integer> {
    // 카테고리별 정보 리스트 조회
    java.util.List<Info> findAllByInfoCategory(String infoCategory);

    // 위치(위도/경도 범위) 내 정보 리스트 조회
    java.util.List<Info> findAllByInfoLatitudeBetweenAndInfoLongitudeBetween(Double minLat, Double maxLat, Double minLng, Double maxLng);

    // 카테고리+위치 동시 필터링
    java.util.List<Info> findAllByInfoCategoryAndInfoLatitudeBetweenAndInfoLongitudeBetween(String infoCategory, Double minLat, Double maxLat, Double minLng, Double maxLng);
}