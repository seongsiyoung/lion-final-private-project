# CI/CD 설명

## 1. GitHub Actions를 사용하는 이유

GitHub Actions는 소스 코드를 관리하는 GitHub 저장소와 CI/CD 환경이 하나로 통합되어 있어, 코드 변경부터 빌드·배포까지의 과정을 간편하게 자동화할 수 있다. 커밋이나 브랜치 푸시와 같은 이벤트를 기준으로 워크플로우를 실행할 수 있어, 반복적인 작업을 줄이고 배포 과정의 일관성을 유지할 수 있다.

## 2. 워크플로우 실행 조건

### frontend-ci

```
  push:
    branches: ["main"]
    paths:
      - "frontend/**"
  workflow_dispatch:
```

- 매인 브랜치에 푸시가 발생하고 프론트엔드 폴더안에 변경이 있을 경우
- workflow_dispatch의 경우에는 수동으로 해당 워크 플로우를 실행할 수 있도록 합니다.(후술 생략)

### frontend-cd

```
on:
  workflow_run:
    workflows: ["Frontend CI"]
    types: [completed]
  workflow_dispatch:

jobs:
  deploy-frontend:
    if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
```

- Frontend CI라는 name의 워크 플로우가 동작이 완료되었거나(실패/성공 모두) 수동으로 실행했을 경우,
- job에 if 조건을 걸어 수동으로 실행했거나 Frontend CI가 성공했을 경우 실행됩니다.

### backend-ci

```
  push:
    branches: ["main"]
    paths:
      - "backend/**"
  workflow_dispatch:
```

### backend-cd

```
on:
  workflow_run:
    workflows: ["Backend CI"]
    types: [completed]
  workflow_dispatch:

jobs:
  deploy-backend:
    if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest

```

- Backend CI라는 name의 워크 플로우가 동작이 완료되었거나(실패/성공 모두) 수동으로 실행했을 경우,
- job에 if 조건을 걸어 수동으로 실행했거나 Backend CI가 성공했을 경우 실행됩니다.

## 3. 자동화된 단계별 흐름

### frontend/backend CI

```
    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build & Push Backend Image
        run: |
          docker build -f ./backend/Dockerfile.prod -t ${{ secrets.DOCKERHUB_USERNAME }}/tmi-backend:latest ./backend
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/tmi-backend:latest
```

1. GitHub 저장소의 코드를 Actions 러너 머신으로 가져오는 액션을 사용합니다.
2. GitHub Actions 러너를 Docker Hub에 인증해 docker push 가능하도록 합니다.
3. 도커의 이미지를 빌드한 다음, 도커허브에 푸시를 합니다.

- 백엔드의 CI도 이 흐름과 같습니다.

### frontend/backend CD

```
    steps:
      - name: Deploy Frontend to EC2
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/${{ secrets.EC2_USER }}/tmi
            git pull origin main
            docker compose -f docker-compose.prod.yml pull frontend
            docker compose -f docker-compose.prod.yml up -d frontend
```

- GitHub Actions에서 EC2 서버로 SSH 접속한 뒤 최신 코드를 git pull로 받아온 다음(정확히는 docker-compose.prod.yml의 동기화를 위해) CI과정에서 푸시한 이미지를 받아 컨테이너로 실행합니다.
- 백엔드의 CD도 이 흐름과 같습니다.

| 구분   | 책임 (What)                        | 수행 내용 (How)                                         |
| ------ | ---------------------------------- | ------------------------------------------------------- |
| **CI** | 배포 가능한 **Docker 이미지 생성** | 코드 변경 감지 → Docker 이미지 빌드 → Docker Hub push   |
| **CD** | 이미지를 **운영 서버에 반영**      | 서버 접속 → 최신 이미지 pull → 변경된 컨테이너만 재기동 |

### CI와 CD가 분리되어 있어서 생기는 장점

1. 실패 전파 차단

   - CI 단계에서 실패한 빌드는 서버에 배포되지 않음
   - 잘못된 코드나 이미지가 운영 환경에 반영되는 것을 방지

2. 변경 범위 최소화

   - Frontend 변경 시 → Frontend 컨테이너만 재시작
   - Backend 변경 시 → Backend 컨테이너만 재시작

3. 책임 구분 명확
   - 이미지 자체에 문제가 있을 경우 → CI 영역
   - 서버에서 컨테이너가 정상 실행되지 않을 경우 → CD 영역

## 4. (있다면) 실패했을 때 원인과 해결 과정

### ERROR: failed to build: failed to solve: failed to read dockerfile: open Dockerfile.prod: no such file or directory

### err: no configuration file provided: not found

- 도커 파일과 도커 컴포즈 파일을 운영환경별로 구분하기 위해 기본 이름이 아닌 다른 이름으로 설정했습니다. 이때 도커를 빌드하거나(ci과정), 도커 컴포즈 파일을 통해 컨테이너를 생성할 때(cd과정) -f 옵션을 주지 않아 에러가 발생했습니다.
- 도커를 빌드하는 명령어와 컨테이너를 생성하는 명령어에 compose -f옵션을 통해 파일 찾을 수 있도록 설정해 해결했습니다.
