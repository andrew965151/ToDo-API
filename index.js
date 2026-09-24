const { app } = require("./app");
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Todo API running on http://localhost:${PORT}`);
});
