import express from "express";
import dotenv from "dotenv"


dotenv.config()

 
const app = express();

import router from "./routes/auth.js";
import error404Middleware from "./middleware/404.js";

app.use(express.json());

app.use(router);

app.use(error404Middleware);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server has started running on http://localhost:${port}`);
});
