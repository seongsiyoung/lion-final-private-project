# 프로젝트 회고

## 1. 가장 막혔던 지점

### 에러 메시지 및 문제 발생

```
View build details: docker-desktop://dashboard/build/multi-arch-builder/multi-arch-builder/k06nnblwzwkqgemtt2bmg@p73 [seongsiyeong@seongsiyeong-ui-MacBook Pro private-final-project % docker-compose -f docker-compose.local.yml up
WARN[0000] The "MYSQL_DATABASE" variable is not set. Defaulting to a blank string.
WARN[0000] The "MYSQL_USER" variable is not set. Defaulting to a blank string. WARN[0000] The "MYSQL_PASSWORD" variable is not set. Defaulting to a blank string.
WARN[0000] The "MYSQL_ROOT_PASSWORD" variable is not set. Defaulting to a blank string.
WARN[0000] The "SPRING_DATASOURCE_USERNAME" variable is not set. Defaulting to a blank string.
WARN[0000] The "SPRING_DATASOURCE_PASSWORD" variable is not set. Defaulting to a blank string.
WARN[0000] The "SPRING_PROFILES_ACTIVE" variable is not set. Defaulting to a blank string.
WARN[0000] The "SPRING_DATASOURCE_URL" variable is not set. Defaulting to a blank string.
[+] Building 29.6s (18/18) FINISHED
```

.env.local에 비밀 정보들을 설정해 놓고 도커 컴포즈 안에 아래와 같이 설정한 다음 불러 오려했으나 위와 같은 에러가 발생했습니다.

```
# docker-compose.local.yml

environment:
      SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
env_file:
  - ./backend/.env.local
```

- ls 명령어를 통해 해당 파일이 존재하는 것과 알맞은 권한(644)를 가진 것도 확인했습니다.

### 해결 방법

- 문제의 원인은 .env 파일과 env_file의 역할을 동일하게 인식한 것이었습니다.
- .env 파일은 Docker Compose 설정 단계에서 사용되며, ${} 형태의 변수 치환에만 영향을 줍니다.
- env_file은 컨테이너 실행 시 환경변수를 주입하기 위한 설정이며, Compose 설정 값에는 영향을 주지 않습니다.
- env_file에 정의된 값을 environment에서 ${}로 참조하려 했기 때문에 Docker Compose가 변수를 찾지 못하고 경고를 출력했습니다.
- environment 설정을 제거하고 env_file만 사용함으로써 문제를 해결했습니다.

## 2. 이해가 부족하다고 느낀 부분

- 프론트엔드의 빌드 과정 및 패키지 구조
  - Next.js 빌드 결과물(.next/standalone, static)이 어떻게 구성되고, 런타임에 어떤 파일만 필요한지에 대한 이해 부족
- Docker Compose의 환경변수 처리 방식
  - .env 파일과 env_file의 역할 차이
  - Compose 설정 단계 변수 치환과 컨테이너 런타임 환경변수 주입 시점에 대한 이해 부족
- 도커 이미지 빌드에 관한 내용
  - 도커 이미지는 단순히 컨테이너의 구성 방식을 정의하는 설정 파일이 아니라, 빌드 시점의 상태를 그대로 보존한 스냅샷이라는 점
  - 빌드 과정에서 민감한 정보가 이미지에 포함될 경우, 해당 이미지가 레포지토리에 업로드되었을 때 보안상 심각한 문제가 발생할 수 있음

## 3. 팀 프로젝트 전에 보완하고 싶은 기술

- 도커 이미지의 태그
- 로그 파일에 대한 설정
- CORS에 대한 처리(Spring security와 함께)
- tailwind

## 4. 혼자 진행하며 느낀 점

지난 교육과정에서 배운 내용들을 바탕으로 혼자 프로젝트를 진행해보면서, 생각보다 이해가 부족한 부분이 많다는 것을 체감하게 되었습니다. 각각의 기능을 학습하는게 크게 어렵지 않았으나, 프로젝트의 구조와 배포·실행 흐름을 이해하며 이를 직접 구성해보는 것이 쉽지 않았습니다.
지난 3일 동안의 최우선 목표는 복잡한 기능 구현보다는 프로젝트를 구성하는 전반적인 흐름을 이해하고, 그 과정에서 드러난 부족한 부분들을 보완하는 것이었습니다. 이를 위해 프로젝트 빌드, 배포 구조, CI/CD 흐름, Docker 기반 환경 구성 등 프로젝트의 기반이 되는 요소들을 중심으로 집중적으로 학습했습니다.
그 결과, 복잡한 비즈니스 로직이나 완성도 높은 애플리케이션을 구현하지는 못했지만, 프로젝트의 전체 구조를 이해하고 배포 과정에 대한 큰 흐름을 파악할 수 있는 좋은 경험을 하게 되었습니다.
