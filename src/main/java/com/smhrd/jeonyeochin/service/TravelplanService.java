package com.smhrd.jeonyeochin.service;

import com.smhrd.jeonyeochin.entity.Travelplan;
import com.smhrd.jeonyeochin.repository.TravelplanRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


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
}