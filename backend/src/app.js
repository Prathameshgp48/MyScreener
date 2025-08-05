import express from "express"
import stockRouter from "./routes/stockData.routes.js"
import stockScreenerRoutes from "./routes/getScreenerResult.route.js"
import cors from "cors"

const app = express()

app.use(cors())

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true }))

//routes
app.use("/api/v1", stockRouter)
app.use("/api", stockScreenerRoutes); 

export default app