import { URLSearchParams } from "url";
import axios from "axios"
import zlib from "zlib"
import { TokenStore } from "../models/token.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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
        // console.log(response.data)

        if (response.status !== 200) {
            return res.status(500).json({ message: "Error requesting access_token" })
        }

        const { access_token, user_id } = response.data

        const issuedAt = new Date()
        let expiryTime = new Date(issuedAt)
        expiryTime.setHours(15, 30, 0, 0) //expiry is 3.30PM IST
        if (issuedAt > expiryTime) {
            expiryTime.setDate(expiryTime.getDate() + 1);
            expiryTime.setHours(15, 30, 0, 0)
        }

        const expiresAt = expiryTime

        const existingUser = await TokenStore.findOne({ userId: user_id })
        if (existingUser) {
            existingUser.accessToken = access_token;
            existingUser.issuedAt = issuedAt;
            existingUser.expiresAt = expiresAt;
            await existingUser.save()
        } else {
            const tokenRecord = await TokenStore.create({
                userId: user_id,
                accessToken: access_token,
                issuedAt,
                expiresAt
            })
        }
        // console.log("token saved")

        const jwtExpirySeconds = Math.floor((expiresAt - issuedAt) / 1000)

        const jwtToken = jwt.sign(
            {userId: user_id},
            process.env.JWT_SECRET,
            {expiresIn: jwtExpirySeconds}
        )
        console.log("JWT Token:", jwtToken)
        res.status(200).json({
            message: "Loggin Succesful",
            jwtToken,
        })
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.send("Failed to fetch access token.");
    }
}

const loadOHLCData = async (req, res) => {
    const { instrument_key, interval, unit, toDate, fromDate } = req.params
    // console.log(instrument_key, req.userId)
    // const decodedKey = decodeURIComponent(instrument_key)
    // console.log(decodedKey)
    // // const encodedInstrumentKey = encodeURIComponent(instrument_key)
    // const currentUser = await TokenStore.findOne({userId: req.userId})
    // if(!currentUser) {
    //     return res.status(404).json({message: "Token not found"})
    // }
    // let accessToken = currentUser.accessToken
    // console.log(accessToken)
    console.log("Final URL:", `https://api.upstox.com/v3/historical-candle/${instrument_key}/${unit}/${interval}/${toDate}/${fromDate}`)


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
                }
            })

        res.status(200).json({ data: response.data?.data?.candles || {} })
    } catch (error) {
        console.error(error.message);
        res.json("Failed to fetch candle data:", error.message);
    }
}

// const loadIntradayData = async (req, res) => {
//     const { instrument_key, interval, unit } = req.params

//     try {
//         const response = await axios.get(`https://api.upstox.com/v3/historical-candle/intraday/${instrument_key}/${unit}/${interval}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
//                     Accept: "application/json",
//                 },
//             })

//         res.status(200).json({ data: response.data?.data?.candles || {} })
//     } catch (error) {
//         console.error(error);
//         res.json("Failed to fetch intraday data:", error);
//     }
// }

const loadIntradayData = async (req, res) => {
    const { interval, unit } = req.params;
    const instrument_key = encodeURIComponent(req.params.instrument_key);

    try {
        // 🔐 Get the user's access token from the database
        const currentUser = await TokenStore.findOne({ userId: req.userId });
        if (!currentUser) {
            return res.status(404).json({ message: "Access token not found for user" });
        }

        const accessToken = currentUser.accessToken;

        // 🔗 Construct the full API URL
        const url = `https://api.upstox.com/v3/historical-candle/intraday/${instrument_key}/${unit}/${interval}`;
        console.log("Requesting URL:", url);

        // 📡 Make the request to Upstox API
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        });
        console.log("Response data:", response.data);
        
        // 📦 Send response back
        res.status(200).json({ data: response.data?.data?.candles || [] });

    } catch (error) {
        const errorData = error.response?.data || { message: error.message };
        console.error("loadIntradayData error:", errorData);

        res.status(400).json({
            message: "Failed to fetch intraday data",
            error: errorData,
        });
    }
};


const getMarketQuote = async (req, res) => {
    const instrumentKey = 'NSE_EQ|INE848E01016'

    console.log(req.userId)
    // const decodedKey = decodeURIComponent(instrument_key)
    // console.log(decodedKey)
    // const encodedInstrumentKey = encodeURIComponent(instrument_key)
    const currentUser = await TokenStore.findOne({ userId: req.userId })
    if (!currentUser) {
        return res.status(404).json({ message: "Token not found" })
    }
    let accessToken = currentUser.accessToken

    try {
        const response = await axios.get(`https://api.upstox.com/v2/market-quote/quotes?instrument_key=${instrumentKey}`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
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

        const filtered = jsonData.filter(item =>
            (item.segment === "NSE_EQ" || item.segment === "BSE_EQ") &&
            !/(\d{4}|\d+\.\d+%|PVT|SDL)/i.test(item.name || item.trading_symbol)
        )

        const instrumentList = filtered.map((data) => {
            return {
                label: data.name || data.trading_symbol,
                instrument_key: data.instrument_key
            }
        }).filter(entry => !!entry.label)

        res.json(instrumentList.splice(100, 10))
    } catch (error) {
        console.error(error);
        res.json("Failed to fetch market quote:", error);
    }
}

export {
    upstoxLogin,
    generateAccessToken,
    loadOHLCData,
    loadIntradayData,
    getMarketQuote,
    getStockList
}