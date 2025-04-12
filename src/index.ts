import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
dotenv.config();

app.get("/", (req: any, res: any) => {
  res.send("Hello World!");
});

app.use("/user", userRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
