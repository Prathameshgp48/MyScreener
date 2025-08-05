import { Router } from "express";
import { generateAccessToken, getMarketQuote, getStockList, loadIntradayData, loadOHLCData, upstoxLogin } from "../controllers/stockData.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/login").get(upstoxLogin)
router.route("/login/generate-token").get(generateAccessToken)
router.route("/candle-data/:instrument_key/:unit/:interval/:toDate/:fromDate").get(verifyJWT, loadOHLCData)
router.route("/intraday/:instrument_key/:unit/:interval").get(verifyJWT, loadIntradayData)
router.route("/market-quote").get(verifyJWT,getMarketQuote)
router.route("/stock-list").get(getStockList)

export default router