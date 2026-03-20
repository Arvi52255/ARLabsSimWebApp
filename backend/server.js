import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AR-Labs Backend Running");
});

app.post("/save", (req, res) => {
  console.log("Received from frontend:", req.body);

  res.json({
    message: "Data received successfully",
    receivedData: req.body
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});