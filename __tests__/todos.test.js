const request = require("supertest");
const { app, resetTodos } = require("../app");

beforeEach(() => {
  resetTodos();
});

describe("GET /todos", () => {
  it("should return an empty array when no todos exist", async () => {
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return all todos after adding some", async () => {
    await request(app).post("/todos").send({ title: "First" });
    await request(app).post("/todos").send({ title: "Second" });

    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ title: "First", completed: false });
    expect(res.body[1]).toMatchObject({ title: "Second", completed: false });
  });

  it("should return todos with correct structure (id, title, completed)", async () => {
    await request(app).post("/todos").send({ title: "Check structure" });

    const res = await request(app).get("/todos");
    const todo = res.body[0];
    expect(todo).toHaveProperty("id");
    expect(todo).toHaveProperty("title", "Check structure");
    expect(todo).toHaveProperty("completed", false);
    expect(typeof todo.id).toBe("number");
  });
});

describe("POST /todos", () => {
  it("should create a new todo with valid title", async () => {
    const res = await request(app).post("/todos").send({ title: "New task" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "New task",
      completed: false,
    });
    expect(res.body).toHaveProperty("id");
    expect(typeof res.body.id).toBe("number");
  });

  it("should assign incrementing IDs to new todos", async () => {
    const res1 = await request(app).post("/todos").send({ title: "Task 1" });
    const res2 = await request(app).post("/todos").send({ title: "Task 2" });

    expect(res2.body.id).toBe(res1.body.id + 1);
  });

  it("should return 400 when title is missing from body", async () => {
    const res = await request(app).post("/todos").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "title is required" });
  });

  it("should return 400 when body is empty", async () => {
    const res = await request(app).post("/todos").send();

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Request body must be a JSON object" });
  });

  it("should return 400 when title is an empty string", async () => {
    const res = await request(app).post("/todos").send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "title must not be empty" });
  });

  it("should persist the todo so GET returns it", async () => {
    await request(app).post("/todos").send({ title: "Persisted" });

    const res = await request(app).get("/todos");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Persisted");
  });

  it("should set completed to false by default", async () => {
    const res = await request(app).post("/todos").send({ title: "Incomplete" });
    expect(res.body.completed).toBe(false);
  });

  it("should ignore extra fields in the request body", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "Only title", extra: "ignored", completed: true });

    expect(res.body.title).toBe("Only title");
    expect(res.body.completed).toBe(false);
    expect(res.body).not.toHaveProperty("extra");
  });
});

describe("DELETE /todos/:id", () => {
  it("should delete an existing todo and return it", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "To delete" });

    const res = await request(app).delete(`/todos/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.body.id,
      title: "To delete",
      completed: false,
    });
  });

  it("should remove the todo from the list after deletion", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "Will be gone" });

    await request(app).delete(`/todos/${created.body.id}`);

    const res = await request(app).get("/todos");
    expect(res.body).toHaveLength(0);
  });

  it("should return 404 for a non-existent todo id", async () => {
    const res = await request(app).delete("/todos/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Todo not found" });
  });

  it("should return 404 when deleting an already-deleted todo", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "Delete twice" });

    await request(app).delete(`/todos/${created.body.id}`);
    const res = await request(app).delete(`/todos/${created.body.id}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Todo not found" });
  });

  it("should only delete the targeted todo, leaving others intact", async () => {
    await request(app).post("/todos").send({ title: "Keep" });
    const toDelete = await request(app)
      .post("/todos")
      .send({ title: "Remove" });
    await request(app).post("/todos").send({ title: "Also keep" });

    await request(app).delete(`/todos/${toDelete.body.id}`);

    const res = await request(app).get("/todos");
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t) => t.title)).toEqual(["Keep", "Also keep"]);
  });

  it("should handle non-numeric id parameter gracefully", async () => {
    const res = await request(app).delete("/todos/abc");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "id must be a positive integer" });
  });
});

describe("Unsupported methods", () => {
  it("PUT /todos/:id should return 404 (not implemented)", async () => {
    const res = await request(app)
      .put("/todos/1")
      .send({ title: "Updated" });

    expect(res.status).toBe(404);
  });

  it("PATCH /todos/:id should return 404 (not implemented)", async () => {
    const res = await request(app)
      .patch("/todos/1")
      .send({ completed: true });

    expect(res.status).toBe(404);
  });
});

describe("Cross-endpoint integration", () => {
  it("should handle a full create-read-delete lifecycle", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ title: "Lifecycle test" });
    expect(created.status).toBe(201);

    let list = await request(app).get("/todos");
    expect(list.body).toHaveLength(1);

    const deleted = await request(app).delete(`/todos/${created.body.id}`);
    expect(deleted.status).toBe(200);
    expect(deleted.body.id).toBe(created.body.id);

    list = await request(app).get("/todos");
    expect(list.body).toHaveLength(0);
  });

  it("should handle creating many todos and deleting them in reverse order", async () => {
    const ids = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/todos")
        .send({ title: `Task ${i}` });
      ids.push(res.body.id);
    }

    let list = await request(app).get("/todos");
    expect(list.body).toHaveLength(5);

    for (let i = ids.length - 1; i >= 0; i--) {
      await request(app).delete(`/todos/${ids[i]}`);
    }

    list = await request(app).get("/todos");
    expect(list.body).toHaveLength(0);
  });
});
