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

    // 여행계획 수정
    public Travelplan updateTravelplan(Integer planId, Travelplan updateData, Integer userId) {
        Travelplan plan = travelplanRepository.findById(planId)
            .orElseThrow(() -> new IllegalArgumentException("여행계획을 찾을 수 없습니다."));
        if (!plan.getUserId().equals(userId)) {
            throw new SecurityException("본인 여행계획만 수정할 수 있습니다.");
        }
        plan.setTravelplanTitle(updateData.getTravelplanTitle());
        plan.setTravelplanContent(updateData.getTravelplanContent());
        plan.setTravelplanStartdate(updateData.getTravelplanStartdate());
        plan.setTravelplanEnddate(updateData.getTravelplanEnddate());
        plan.setTravelplanDeparture(updateData.getTravelplanDeparture());
        plan.setTravelplanDestination(updateData.getTravelplanDestination());
        plan.setTravelplanLayover(updateData.getTravelplanLayover());
        return travelplanRepository.save(plan);
    }

    // 여행계획 삭제 (본인만 가능)
    public void deleteTravelplan(Integer planId, Integer userId) {
        Travelplan plan = travelplanRepository.findById(planId)
            .orElseThrow(() -> new IllegalArgumentException("여행계획을 찾을 수 없습니다."));
        if (!plan.getUserId().equals(userId)) {
            throw new SecurityException("본인 여행계획만 삭제할 수 있습니다.");
        }
        travelplanRepository.delete(plan);
    }
}