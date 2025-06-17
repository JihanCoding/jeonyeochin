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
}