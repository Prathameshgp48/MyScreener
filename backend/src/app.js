import express from "express"
import stockRouter from "./routes/stockData.routes.js"

const app = express()

app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true}))

//routes
app.use("/api/v1", stockRouter)

export default app