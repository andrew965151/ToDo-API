const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

let todos = [];
let nextId = 1;

// GET /todos - 전체 할 일 목록 조회
app.get("/todos", (req, res) => {
  res.json(todos);
});

// POST /todos - 새 할 일 추가
app.post("/todos", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const todo = { id: nextId++, title, completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// DELETE /todos/:id - 할 일 삭제
app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const deleted = todos.splice(index, 1)[0];
  res.json(deleted);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Todo API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
