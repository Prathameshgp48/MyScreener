import { MACD, RSI } from "technicalindicators"
import { URLSearchParams } from "url";
import axios from "axios"
import zlib from "zlib"
import { TokenStore } from "../models/token.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const getScreenerResults = async (req, res) => {
    try {
        // const currentUser = await TokenStore.findOne({ userId: req.userId });
        // if (!currentUser) return res.status(404).json({ message: "Token not found" });

        // const accessToken = currentUser.accessToken;

        const response = await axios.get(`https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz`, {
            responseType: 'arraybuffer'
        });
        const decompressed = zlib.gunzipSync(Buffer.from(response.data));
        const jsonData = JSON.parse(decompressed.toString('utf8'));

        const filteredStocks = jsonData.filter(item =>
            (item.segment === "NSE_EQ" || item.segment === "BSE_EQ") &&
            !/(\d{4}|\d+\.\d+%|PVT|SDL)/i.test(item.name || item.trading_symbol)
        ).slice(0, 20); // limit to first 20 stocks to avoid overload

        const finalResults = [];

        for (const stock of filteredStocks) {
            const instrumentKey = stock.instrument_key;
            const toDate = "2025-07-28";
            const fromDate = "2025-07-25";

            let intradayRes;
            try {
                intradayRes = await axios.get(`http://localhost:5000/api/v1/intraday/${instrumentKey}/minutes/5`, {
                    headers: {
                        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0M0NBNkgiLCJpYXQiOjE3NTM4NDc3NzEsImV4cCI6MTc1Mzg2OTU5OX0.mLVbbhYJ2k24HQcjsQkhFniHlpJpEH3H3UprkAaqRO4`,
                        Accept: "application/json",
                    },
                });
            } catch (err) {
                console.warn(`Skipping ${instrumentKey} - intraday fetch failed`);
                continue;
            }

            const candles = intradayRes.data?.data?.candles || [];
            const resolvedInstrumentKey = intradayRes.data?.data?.instrument_key;
            if (!resolvedInstrumentKey || candles.length < 35) continue;

            // Fetch latest LTP quote for this resolvedInstrumentKey
            let ltpData;
            try {
                const ltpRes = await axios.get(`https://api.upstox.com/v3/market-quote/ltp`, {
                    headers: {
                        Authorization: `Bearer YOUR_LIVE_ACCESS_TOKEN`,
                        Accept: "application/json",
                    },
                    params: {
                        instrument_key: resolvedInstrumentKey
                    }
                });

                ltpData = ltpRes.data?.data?.[resolvedInstrumentKey];
                if (!ltpData) continue;
            } catch (err) {
                console.warn(`Skipping ${resolvedInstrumentKey} - LTP fetch failed`);
                continue;
            }

            const closePrices = candles.map(c => c[4]);
            const volumes = candles.map(c => c[5]);

            const latest = candles[candles.length - 1];
            const prev = candles[candles.length - 2];

            const pivot = (prev[1] + prev[2] + prev[3]) / 3;
            const lastPrice = ltpData.last_price;
            const volume = ltpData.volume;

            const macd = MACD.calculate({
                values: closePrices,
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9,
                SimpleMAOscillator: false,
                SimpleMASignal: false,
            });

            const rsi = RSI.calculate({
                period: 14,
                values: closePrices,
            });

            const macdCrossover = macd.length > 1 &&
                macd[macd.length - 2].MACD < macd[macd.length - 2].signal &&
                macd[macd.length - 1].MACD > macd[macd.length - 1].signal;

            const isRSIAbove50 = rsi[rsi.length - 1] > 50;
            const isVolumeInRange = volume >= 300000 && volume <= 500000;
            const isPriceAbove100 = lastPrice >= 100;
            const trend = lastPrice >= pivot ? "bullish" : "bearish";

            if (macdCrossover && isRSIAbove50 && isVolumeInRange && isPriceAbove100) {
                finalResults.push({
                    name: stock.name || stock.trading_symbol,
                    instrumentKey: resolvedInstrumentKey,
                    lastPrice,
                    trend,
                    volume,
                    rsi: rsi[rsi.length - 1],
                    macd: macd[macd.length - 1],
                });
            }
        }

        res.json({ count: finalResults.length, results: finalResults });
    } catch (error) {
        console.error("Error in getScreenerResults:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

export {
    getScreenerResults
}
