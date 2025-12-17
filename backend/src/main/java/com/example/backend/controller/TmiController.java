package com.example.backend.controller;


import com.example.backend.domain.Tmi;
import com.example.backend.dto.TmiRequest;
import com.example.backend.service.TmiService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TmiController {

    private final TmiService tmiService;

    // TMI 목록 조회
    @GetMapping
    public ResponseEntity<List<Tmi>> getAllTmi() {
        return ResponseEntity.ok(tmiService.getAllTmi());
    }

    // TMI 등록
    @PostMapping
    public ResponseEntity<Tmi> createTmi(@RequestBody TmiRequest request) {
        Tmi tmi = tmiService.createTmi(request.getContent());
        return ResponseEntity.ok(tmi);
    }
}