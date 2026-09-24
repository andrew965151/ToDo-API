# ToDo-API

간단한 할 일(Todo) 관리 REST API 서버입니다.

## API 엔드포인트

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/todos` | 전체 할 일 목록 조회 |
| POST | `/todos` | 새 할 일 추가 (`{ "title": "..." }`) |
| DELETE | `/todos/:id` | 할 일 삭제 |

## 로컬 실행

```bash
npm install
node index.js
```

서버가 http://localhost:3000 에서 실행됩니다.

## Docker로 실행

### Docker만 사용

```bash
# 이미지 빌드
docker build -t todo-api .

# 컨테이너 실행
docker run -p 3000:3000 todo-api
```

### Docker Compose 사용

```bash
# 빌드 및 실행
docker compose up --build

# 백그라운드 실행
docker compose up --build -d

# 중지
docker compose down
```

컨테이너가 실행되면 http://localhost:3000 에서 API에 접근할 수 있습니다.
