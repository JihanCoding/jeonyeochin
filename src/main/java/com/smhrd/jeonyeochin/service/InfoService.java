package com.smhrd.jeonyeochin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.jeonyeochin.entity.Info;
import com.smhrd.jeonyeochin.repository.InfoRepository;

@Service
@Transactional
public class InfoService {

    @Autowired
    private InfoRepository infoRepository;

    // 정보 생성
    public Info saveInfo(Info info) {
        // 정보 저장
        return infoRepository.save(info);
    }

    // 전체 정보 리스트 반환
    public java.util.List<Info> findAll() {
        return infoRepository.findAll();
    }

    // infoId로 Info 상세 조회
    public Info findById(Integer infoId) {
        return infoRepository.findById(infoId).orElse(null);
    }

    // 카테고리별 정보 리스트 조회
    public java.util.List<Info> findByCategory(String infoCategory) {
        return infoRepository.findAllByInfoCategory(infoCategory);
    }

    // 위치(위도/경도 범위) 내 정보 리스트 조회
    public java.util.List<Info> findByLocation(Double minLat, Double maxLat, Double minLng, Double maxLng) {
        return infoRepository.findAllByInfoLatitudeBetweenAndInfoLongitudeBetween(minLat, maxLat, minLng, maxLng);
    }

    // 카테고리+위치 동시 필터링
    public java.util.List<Info> findByCategoryAndLocation(String infoCategory, Double minLat, Double maxLat, Double minLng, Double maxLng) {
        return infoRepository.findAllByInfoCategoryAndInfoLatitudeBetweenAndInfoLongitudeBetween(infoCategory, minLat, maxLat, minLng, maxLng);
    }
}