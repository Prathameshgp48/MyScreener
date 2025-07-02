import { URLSearchParams } from "url";
import axios from "axios"

//suppose to be added in frontend
const upstoxLogin = async (req, res) => {
    const loginURL = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${process.env.UPSTOX_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        process.env.REDIRECT_URI
    )}`;

    res.redirect(loginURL)
}

const generateAccessToken = async (req, res) => {
    const code = req.query.code
    if (!code) return res.send("No auth code received")

    const body = new URLSearchParams({
        code: code,
        client_id: process.env.UPSTOX_CLIENT_ID,
        client_secret: process.env.UPSTOX_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code"
    })

    try {
        const response = await axios.post("https://api.upstox.com/v2/login/authorization/token", body,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                }
            })

        const { access_token, user_id } = response.data
        res.send(
            `<h2>Login Successful</h2><p>User ID: ${user_id}</p><p>Access Token: ${access_token}</p>`
        );
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.send("Failed to fetch access token.");
    }
}

const loadOHLCData = async(req, res) => {
    const instrument_key = "NSE_EQ|INE002A01018"; // RELIANCE
    const unit = "day";
    const interval = "1";
    const to_date = "2024-06-01";
    const from_date = "2024-06-10";
    
    try {
        const response = await axios.get("https://api.upstox.com/v3/historical-candle/NSE_EQ%7CINE848E01016/minutes/3/2025-01-02/2025-01-01",
            {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                    Accept: "application/json",
                },
            })
        
        res.json(response.data)
    } catch (error) {
        console.error(error);
        res.json("Failed to fetch candle data:", error);
    }
}

const getMarketQuote = async(req, res) => {
    const instrumentKey = 'NSE_EQ|INE848E01016'

    try {
        const response = await axios.get(`https://api.upstox.com/v2/market-quote/quotes`, {
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            },
            params: {
                instrument_key: instrumentKey
            }
        })

        res.json(response.data)
    } catch (error) {
        console.error(error);
        res.json("Failed to fetch market quote:", error);
    }
}

export {
    upstoxLogin,
    generateAccessToken,
    loadOHLCData,
    getMarketQuote
}