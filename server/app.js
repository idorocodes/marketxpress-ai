import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from  "morgan"

dotenv.config();


const app = express();

import error404Middleware from "./middleware/404.js";
import authRouter from "./routes/auth.js";
import vendorRouter from "./routes/vendor.js";
import deciderRouter from "./routes/decider.js";
import dealRouter from "./routes/deal.js";

app.use(morgan("dev"))

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/deals", dealRouter);
app.use("/api/decider", deciderRouter);
app.use(error404Middleware);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server has started running on http://localhost:${port}`);
});

export default app;
