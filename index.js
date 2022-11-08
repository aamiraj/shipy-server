const express = require("express");
const app = express();
const port = 5000 || process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World! Server is running...");
});

app.listen(port, () => {
  console.log(`Shipy app listening on port ${port}`);
});
