import express from "express"



const app = express();
   
import router from "./routes/auth.js";



app.use(express.json())

app.use(router)


const port = process.env.PORT||3000

app.listen(port, () =>{
    console.log(`Server has started running on http://localhost:${port}`)
}) 