package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.Travelplan;
import com.smhrd.jeonyeochin.repository.TravelplanRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TravelplanService {
    
    @Autowired
    private TravelplanRepository travelplanRepository;

    // 여행계획 생성
    public Travelplan saveTravelplan(Travelplan travelplan) {
        // 여행계획 정보 저장
        return travelplanRepository.save(travelplan);
    }

    // 특정 사용자의 여행계획 목록 조회
    public List<Travelplan> getTravelplansByUserId(Integer userId) {
        return travelplanRepository.findAllByUserId(userId);
    }

    // 여행계획 상세 조회
    public Travelplan getTravelplanById(Integer planId) {
        return travelplanRepository.findById(planId).orElse(null);
    }
}