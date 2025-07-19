import WebSocket from "ws"
import protobuf from "protobufjs"
import axios from "axios"
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import dotenv from "dotenv"

dotenv.config()

let protobufRoot = null;
const accessToken = process.env.ACCESS_TOKEN;

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

//loads .proto(structure of message) to decode the message
const initProtoBuf = async () => {
    const protoPath = path.join(__dirname, "MarketDataFeedV3.proto")
    protobufRoot = await protobuf.load(protoPath)
    console.log("ProtoBuf initialized...")
}

//decode incoming binary message(buffer) 
const decodeProtobuf = (buffer) => {
    if (!protobufRoot) return null
    const response = protobufRoot.lookupType(
        "com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse"
    )
    return response.decode(buffer)
}

//this one fetches the websocket URL from upstox
const getMarketFeedUrl = async () => {
    try {
        const response = await axios.get("https://api.upstox.com/v3/feed/market-data-feed/authorize", {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })

        return response.data.data.authorizedRedirectUri
    } catch (error) {
        console.log("Error fetching websocket url!!", error)
    }
}

const connectWebSocket = async (wsUrl, io) => {
    const ws = new WebSocket(wsUrl, {
        followRedirects: true
    })

    ws.on("open", () => {
        console.log("Websocket connected...")

        const data = {
            guid: "someguid",
            method: "sub",
            data: {
                mode: "full",
                instrumentKeys: ["NSE_INDEX|Nifty Bank", "NSE_INDEX|Nifty 50"]
            }
        }

        setTimeout(() => {
            ws.send(Buffer.from(JSON.stringify(data)))
        }, 1000)
    })
     
    ws.on("message", (data) => {
        try {
            const decoded = decodeProtobuf(data)
            if (decoded) {
                io.emit("liveData", decoded)
                console.log("⬆ LiveData emitted to clients")
            }
        } catch (error) {
            console.error("Error decoding!!", error)
        }
    })

    ws.on("close", () => console.log("Websocket closed"))
    ws.on("error", (error) => console.error("Websocket error!!", error))
}

const initializeWebSocket = async (io) => {
    try {
        await initProtoBuf()
        const wsUrl = await getMarketFeedUrl()
        await connectWebSocket(wsUrl, io)
    } catch (error) {
        console.error("Failed to initialize websocket", error)
    }
}

export default initializeWebSocket