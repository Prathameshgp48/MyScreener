import app from "./app.js"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import initializeWebSocket from "./utils/websocket/websocket_client.js"
import connectDB from "./db/index.js"

dotenv.config({ path: "./.env" })

const port = process.env.PORT || 8000

// const server = http.createServer(app)
// const io = new Server(server, {
//     cors: {
//         origin: "*"
//     }
// })

connectDB()
    .then(() => {
        app.on("Error", (error) => {
            console.log("ERR:", error)
            throw error
        })

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`)
        })
    }).catch((err) => console.log("MONGODB CONNECTION FAILED:", err))

// initializeWebSocket(io)
