const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

let todos = [];
let nextId = 1;

// GET /todos - 전체 할 일 목록 조회
app.get("/todos", (req, res, next) => {
  try {
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// POST /todos - 새 할 일 추가
app.post("/todos", (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Request body must be a JSON object" });
    }

    const { title } = req.body;

    if (title === undefined || title === null) {
      return res.status(400).json({ error: "title is required" });
    }

    if (typeof title !== "string") {
      return res.status(422).json({ error: "title must be a string" });
    }

    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({ error: "title must not be empty" });
    }

    const todo = { id: nextId++, title: trimmed, completed: false };
    todos.push(todo);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE /todos/:id - 할 일 삭제
app.delete("/todos/:id", (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const index = todos.findIndex((t) => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const deleted = todos.splice(index, 1)[0];
    res.json(deleted);
  } catch (err) {
    next(err);
  }
});

// 404 핸들러 - 정의되지 않은 라우트
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// 글로벌 에러 핸들링 미들웨어
app.use((err, req, res, _next) => {
  console.error(err.stack || err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Todo API running on http://localhost:${PORT}`);
});
