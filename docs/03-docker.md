# Docker 구성 설명

## 1. Docker를 사용하는 이유

도커의 가장 큰 장점은 다양한 환경에서 동일한 실행 환경을 보장한다는 점이다. 이를 통해 개발 환경과 운영 환경의 차이로 인해 발생하는 문제를 예방하고, 어디서나 동일한 조건에서 애플리케이션을 실행할 수 있다. 또한 애플리케이션을 이미지 형태로 패키징하여 배포할 수 있어 배포 과정이 간단해지고, 이미지 공유와 재사용이 용이해 빠른 확장과 배포가 가능하다. 도커는 각 컨테이너를 독립적이고 격리된 환경으로 실행하므로 하나의 컨테이너에서 발생한 문제가 발생하더라도 다른 컨테이너에 영향을 주지 않아 시스템의 안정성을 높일 수 있다.

## 2. Backend Dockerfile 설명

### FROM gradle:8.14-jdk17 AS build

Gradle과 JDK 17이 설치된 이미지 빌드 전용 단계로 사용 -> 멀티 스테이지 빌드를 통해 최종 이미지의 크기를 줄일 수 있습니다.

### WORKDIR /tmi

컨테이너 내부 작업 디렉터리를 /tmi로 설정합니다.

### COPY . .

백엔드 프로젝트 전체를 컨테이너로 복사합니다.

### RUN gradle clean build -x test

Gradle로 프로젝트 빌드합니다.(테스트를 제외)

### FROM eclipse-temurin:17-jre-jammy

실행 전용 런타임 이미지로 실행만하면 되기 때문에 JDK가 아닌 JRE만 포함해 이미지 크기 를 줄일 수 있습니다.

### WORKDIR /tmi

컨테이너 내부 작업 디렉터리를 /tmi로 설정합니다.

### COPY --from=build /tmi/build/libs/\*.jar app.jar

빌드 단계에서 생성된 jar을 app.jar의 이름으로 복사합니다.

### EXPOSE 8080

애플리케이션이 사용할 포트를 명시합니다.

### ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

ENTRYPOINT명령어로 컨테이너 실행시 스프링 부트 어플리케이션이 실행되도록 설정합니다. $JAVA_OPTS를 통해 자바 실행 옵션을 설정합니다.(도커 컴포즈로부터 환경변수로 주입 받고 sh -c 를 통해 환경변수를 치환할 수 있습니다.)

## 3. Frontend Dockerfile 설명

### FROM node:20-alpine AS builder

Node.js 20 기반의 경량 Alpine 이미지로 빌드 전용 단계입니다.

### WORKDIR /tmi

컨테이너 내부 작업 디렉터리를 /tmi로 설정합니다.

### COPY package\*.json ./

프론트 패키지 내부의 package.json과 package-lock.json파일을 복사합니다.

### RUN npm install

필요한 의존성 파일을 package.json과 package-lock.json파일을 참고해 설치합니다.

### COPY . .

프론트 엔드의 전체코드를 복사합니다.
-> COPY package*.json ./을 먼저 하는 이유?
각 줄은 레이어이기 때문에 변경할 사항이 없으면 도커 캐시를 통해서 재사용하게 됩니다. 전체 코드를 처음부터 복사할 경우 한 글자만 바뀌어도 해당 레이어 및 이후의 레이어 전체를 다시 생성하기 때문에 COPY package*.json을 먼저합니다.

### ARG NEXT_PUBLIC_API_BASE_URL

Docker 이미지를 빌드할 때만 사용하는 변수

### ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

빌드 시 전달 받은 ARG변수를 컨테이너 내부 환경 변수에 넣는다.

### RUN npm run build

next.js를 빌드하며, 실행에 필요한 최소한의 패키지인 standalone생성(설정 필요)

### FROM node:20-alpine

Node.js 20 기반의 경량 Alpine 이미지로 실행용 이미지입니다.

### WORKDIR /tmi

컨테이너 내부 작업 디렉터리를 /tmi로 설정합니다.

### COPY --from=builder /tmi/.next/standalone ./

스탠드 얼론 복사

### COPY --from=builder /tmi/.next/static ./.next/static

정적 리소스 (JS, CSS ...) 복사

### COPY --from=builder /tmi/public ./public

public/ 폴더 (이미지, favicon 등) 복사

### CMD ["node", "server.js"]

컨테이너 실행 시 Node.js 서버를 실행

## 4. docker-compose 역할

#### Docker Compose는 여러 개의 컨테이너(MySQL, Backend, Frontend)를 하나의 애플리케이션처럼 묶어서 관리하기 위해 사용

#### 도커 컴포즈의 역할

Docker Compose는 여러 컨테이너를 하나의 애플리케이션처럼 관리하면서도, 각 서비스는 독립적으로 운영할 수 있도록 해줍니다.

1. 여러 컨테이너를 한번에 실행 및 종료가 가능해 배포와 운영을 간편화
2. 같은 네트워크로 자동으로 생성해 별도의 설정 없이도 안정적인 컨테이너간 통신이 가능
3. 서비스의 의존성을 관리해 실행순서 제어 가능
4. 환경 변수 및 설정 관리를 함으로써 보안 및 관리성 향상
5. 각 컨테이너 별 리소스 및 실행 환경 통제 가능

#### 도커 컴포즈의 장점

| 항목        | 설명                                                 |
| ----------- | ---------------------------------------------------- |
| 역할 분리   | DB, API 서버, UI의 책임을 컨테이너별로 명확히 분리   |
| 독립 배포   | 프론트 수정 시 프론트 컨테이너만 재배포 가능         |
| 확장성      | 확장이 필요할 경우 컨테이너만 여러 개로 확장 가능    |
| 장애 격리   | MySQL 장애 발생 시 DB 컨테이너 단위로 문제 파악 가능 |
| 운영 안정성 | 하나의 서비스 장애가 전체로 전파되지 않음            |
