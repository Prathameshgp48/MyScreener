import { URLSearchParams } from "url";
import axios from "axios"
import zlib from "zlib"

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

const loadOHLCData = async (req, res) => {
    const { instrument_key, interval, unit, toDate, fromDate } = req.params

    // // For 1 Month Chart
    // GET / v3 / historical - candle / NSE_EQ | INE848E01016 / minutes / 15 / 2025-07-03 / 2025-06-03
    // // For 6 Month Chart
    // GET / v3 / historical - candle / NSE_EQ | INE848E01016 / days / 1 / 2025-07-03 / 2025-01-03
    // // For 1 Year Chart
    // GET / v3 / historical - candle / NSE_EQ | INE848E01016 / days / 1 / 2024-07-03 / 2025-07-03
    // // For 3 Year Chart
    // GET / v3 / historical - candle / NSE_EQ | INE848E01016 / weeks / 1 / 2025-07-03 / 2022-07-03


    try {
        const response = await axios.get(`https://api.upstox.com/v3/historical-candle/${instrument_key}/${unit}/${interval}/${toDate}/${fromDate}`,
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

const getMarketQuote = async (req, res) => {
    const instrumentKey = 'NSE_EQ|INE848E01016'

    try {
        const response = await axios.get(`https://api.upstox.com/v2/market-quote/quotes?instrument_key=${instrumentKey}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            },
            params: {
                instrument_key: instrumentKey
            }
        })

        console.log(response.data)

        const quoteValues = Object.values(response.data?.data || {});
        const quote = quoteValues[0];

        if (!quote) {
            return res.status(404).json({ error: 'Quote data not found' });
        }

        const marketQuote = {
            symbol: quote.symbol,
            last_price: quote.last_price,
            volume: quote.volume,
            average_price: quote.average_price,
            timestamp: quote.timestamp,
        };

        res.json(marketQuote)
    } catch (error) {
        console.error(error);
        res.json("Failed to fetch market quote:", error);
    }
}

const getStockList = async (req, res) => {
    try {
        const response = await axios.get(`https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz`,
            { responseType: 'arraybuffer' }
        )

        const decompressed = zlib.gunzipSync(Buffer.from(response.data));

        const jsonData = JSON.parse(decompressed.toString('utf8'));

        res.json(jsonData.splice(1, 10))
    } catch (error) {
        console.error(error);
        res.json("Failed to fetch market quote:", error);
    }
}

export {
    upstoxLogin,
    generateAccessToken,
    loadOHLCData,
    getMarketQuote,
    getStockList
}