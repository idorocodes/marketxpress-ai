import express from "express";
import dotenv from "dotenv"


dotenv.config()

 
const app = express();
 
import error404Middleware from "./middleware/404.js";
import authRouter from "./routes/auth.js";
import vendorRouter from "./routes/vendor.js";

app.use(express.json());

app.use("/api/auth",authRouter);
app.use("/api/vendor",vendorRouter);

app.use(error404Middleware);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server has started running on http://localhost:${port}`);
});



export default app