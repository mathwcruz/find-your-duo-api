import express from "express";

const app = express();

app.get("/ads", (req, res) => {
  return res.json({
    ads: [
      { id: 1, name: "First AD" },
      { id: 2, name: "Second AD" },
    ],
  });
});

app.listen(3333);
