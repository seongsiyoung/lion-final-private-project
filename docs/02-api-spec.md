# API 명세서

## 1. 전체 TMI 목록 조회

| 항목     | 내용                                |
| -------- | ----------------------------------- |
| URL      | GET `/api/tmis`                     |
| Request  | 없음                                |
| Response | `[{ id, content, createdAt }, ...]` |

## 2. TMI 등록

| 항목     | 내용                         |
| -------- | ---------------------------- |
| URL      | POST `/api/tmi`              |
| Request  | `{ content }`                |
| Response | `{ id, content, createdAt }` |
