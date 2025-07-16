import { Router } from "express";
import { generateAccessToken, getMarketQuote, getStockList, loadIntradayData, loadOHLCData, upstoxLogin } from "../controllers/stockData.controller.js";

const router = Router()

router.route("/login").get(upstoxLogin)
router.route("/login/generate-token").get(generateAccessToken)
router.route("/candle-data/:instrument_key/:unit/:interval/:toDate/:fromDate").get(loadOHLCData)
router.route("/intraday/:instrument_key/:unit/:interval").get(loadIntradayData)
router.route("/market-quote").get(getMarketQuote)
router.route("/stock-list").get(getStockList)

export default router