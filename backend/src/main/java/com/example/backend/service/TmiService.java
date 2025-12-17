package com.example.backend.service;


import com.example.backend.domain.Tmi;
import com.example.backend.repository.TmiRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TmiService {

    private final TmiRepository tmiRepository;

    // TMI 목록 조회
    public List<Tmi> getAllTmi() {
        return tmiRepository.findAll();
    }

    // TMI 등록
    @Transactional
    public Tmi createTmi(String content) {
        Tmi tmi = Tmi.builder()
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
        return tmiRepository.save(tmi);
    }
}