# 프로젝트 설계 개선 필요 특히 5번

## 1. 서비스 설명

오늘의 TMI(Today’s TMI)는 사용자가 하루 동안의 사소한 TMI(Too Much Information)를 기록하고 확인할 수 있는 간단한 개인 방명록 서비스입니다.

## 2. 전체 흐름

1. 사용자가 홈페이지에서 오늘의 TMI를 작성
2. 프론트엔드가 입력 데이터를 JSON 형태로 백엔드 API에 전송
3. 백엔드는 요청을 받아 DB에 저장
4. 사용자가 TMI 목록을 조회할 때, 프론트엔드는 GET방식으로 호출
5. 백엔드는 DB에서 TMI 리스트를 조회하여 JSON으로 응답
6. 프론트엔드는 받은 데이터를 화면에 표시

## 3. 프론트엔드 역할

- UI 제공: TMI 작성 폼, TMI 목록 화면
- 사용자 입력 처리
- 백엔드 API 호출 (GET / POST)
- 로컬 상태 관리 및 화면 렌더링

## 4. 백엔드 역할

- REST API 제공:
  - POST → TMI 등록
  - GET → TMI 목록 조회
- DB 연동 및 데이터 모델 관리
- 입력 데이터 유효성 검증
- 환경별 설정 관리 (로컬/배포용 application.yml)

## 5. 배포 구조 요약

| 구분       | 로컬 개발             | 배포 환경            |
| ---------- | --------------------- | -------------------- |
| DB         | MySQL                 | MySQL                |
| 백엔드     | `localhost:8080`      | AWS EC2              |
| 프론트엔드 | `localhost:3000`      | AWS EC2              |
| 환경 설정  | application-local.yml | application-prod.yml |
