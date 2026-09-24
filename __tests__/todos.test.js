const request = require("supertest");
const app = require("../index");

describe("GET /todos", () => {
  test("returns an empty array initially", async () => {
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /todos", () => {
  test("creates a new todo", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "Test Todo" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Test Todo");
    expect(res.body.completed).toBe(false);
  });

  test("returns 400 when title is missing", async () => {
    const res = await request(app).post("/todos").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("title is required");
  });
});

describe("DELETE /todos/:id", () => {
  test("deletes an existing todo", async () => {
    const createRes = await request(app)
      .post("/todos")
      .send({ title: "To Delete" });
    const id = createRes.body.id;

    const res = await request(app).delete(`/todos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("To Delete");
  });

  test("returns 404 for non-existent todo", async () => {
    const res = await request(app).delete("/todos/99999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });
});
