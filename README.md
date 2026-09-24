# ToDo API

할 일(Todo) 관리를 위한 RESTful API 서버입니다.

## 기술 스택

| 항목 | 내용 |
|------|------|
| 런타임 | Node.js |
| 프레임워크 | Express 5.x |
| 데이터 저장 | 인메모리 (서버 재시작 시 초기화) |

## 시작하기

### 사전 요구사항

- [Node.js](https://nodejs.org/) v18 이상

### 설치

```bash
git clone https://github.com/andrew965151/ToDo-API.git
cd ToDo-API
npm install
```

### 서버 실행

```bash
node index.js
```

서버가 `http://localhost:3000`에서 실행됩니다.

---

## API 문서

### 데이터 모델

**Todo 객체**

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 자동 생성되는 고유 식별자 |
| `title` | `string` | 할 일 제목 |
| `completed` | `boolean` | 완료 여부 (기본값: `false`) |

```json
{
  "id": 1,
  "title": "우유 사기",
  "completed": false
}
```

---

### 엔드포인트 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/todos` | 전체 할 일 목록 조회 |
| `POST` | `/todos` | 새 할 일 추가 |
| `DELETE` | `/todos/:id` | 할 일 삭제 |

---

### `GET /todos`

전체 할 일 목록을 조회합니다.

**요청 파라미터:** 없음

**응답**

- **상태 코드:** `200 OK`
- **본문:** Todo 객체 배열

```json
[
  {
    "id": 1,
    "title": "우유 사기",
    "completed": false
  },
  {
    "id": 2,
    "title": "이메일 확인",
    "completed": false
  }
]
```

할 일이 없는 경우 빈 배열을 반환합니다.

```json
[]
```

**curl 예시**

```bash
curl http://localhost:3000/todos
```

---

### `POST /todos`

새로운 할 일을 추가합니다.

**요청 헤더**

| 헤더 | 값 |
|------|------|
| `Content-Type` | `application/json` |

**요청 본문**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | `string` | ✅ | 할 일 제목 |

```json
{
  "title": "장보기"
}
```

**응답 — 성공**

- **상태 코드:** `201 Created`
- **본문:** 생성된 Todo 객체

```json
{
  "id": 3,
  "title": "장보기",
  "completed": false
}
```

**응답 — 실패**

`title`이 누락된 경우:

- **상태 코드:** `400 Bad Request`

```json
{
  "error": "title is required"
}
```

**curl 예시**

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "장보기"}'
```

---

### `DELETE /todos/:id`

지정한 ID의 할 일을 삭제합니다.

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | `number` | 삭제할 할 일의 ID |

**응답 — 성공**

- **상태 코드:** `200 OK`
- **본문:** 삭제된 Todo 객체

```json
{
  "id": 1,
  "title": "우유 사기",
  "completed": false
}
```

**응답 — 실패**

해당 ID의 할 일이 존재하지 않는 경우:

- **상태 코드:** `404 Not Found`

```json
{
  "error": "Todo not found"
}
```

**curl 예시**

```bash
curl -X DELETE http://localhost:3000/todos/1
```

---

## 사용 예시

아래는 할 일을 추가하고, 조회하고, 삭제하는 전체 흐름입니다.

```bash
# 1. 할 일 추가
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "리포트 작성"}'
# → {"id":1,"title":"리포트 작성","completed":false}

# 2. 할 일 하나 더 추가
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "회의 참석"}'
# → {"id":2,"title":"회의 참석","completed":false}

# 3. 전체 목록 조회
curl http://localhost:3000/todos
# → [{"id":1,"title":"리포트 작성","completed":false},{"id":2,"title":"회의 참석","completed":false}]

# 4. 첫 번째 할 일 삭제
curl -X DELETE http://localhost:3000/todos/1
# → {"id":1,"title":"리포트 작성","completed":false}

# 5. 삭제 후 목록 다시 조회
curl http://localhost:3000/todos
# → [{"id":2,"title":"회의 참석","completed":false}]
```

## 라이선스

[ISC](LICENSE)
