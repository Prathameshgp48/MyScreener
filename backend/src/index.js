import app from "./app.js"
import dotenv from "dotenv"
import http from "http"
import {Server} from "socket.io"
import initializeWebSocket from "./utils/websocket/websocket_client.js"

dotenv.config({path: "./.env"})

const port = process.env.PORT || 8000

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})

initializeWebSocket(io)
