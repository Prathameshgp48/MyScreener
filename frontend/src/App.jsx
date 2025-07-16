import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import CandleChart from "./CandleChart";
import {io} from "socket.io-client"


function App() {
  const [interval, setInterval] = useState(15);
  const [unit, setUnit] = useState("minutes");
  const [filter, setFilter] = useState("1D");
  const [candles, setCandles] = useState([]);
  const [toDate, setToDate] = useState("");
  const [fromDate, setFromDate] = useState("");

  const units = [
    { id: 1, value: "1D" },
    { id: 2, value: "5D" },
    { id: 3, value: "1M" },
    { id: 4, value: "3M" },
    { id: 5, value: "6M" },
    { id: 6, value: "1Y" },
    { id: 7, value: "3Y" },
  ];

  const setGranularity = async (range) => {
    const now = new Date();
    const to = now.toISOString().split("T")[0];
    let computedUnit = "minutes";
    let computedInterval = 15;

    const from = new Date();
    switch (range) {
      case "1D":
        computedUnit = "minutes";
        computedInterval = 1;
        // from.setDate(now.getDate() - 1);
        break;
      case "5D":
        computedUnit = "minutes";
        computedInterval = 15;
        from.setDate(now.getDate() - 5);
        break;
      case "1M":
        computedUnit = "minutes";
        computedInterval = 30;
        from.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        computedUnit = "days";
        computedInterval = 1;
        from.setMonth(now.getMonth() - 3);
        break;
      case "6M":
        computedUnit = "days";
        computedInterval = 1;
        from.setMonth(now.getMonth() - 6);
        break;
      case "1Y":
        computedUnit = "days";
        computedInterval = 1;
        from.setFullYear(now.getFullYear() - 1);
        break;
      case "3Y":
        computedUnit = "weeks";
        computedInterval = 1;
        from.setFullYear(now.getFullYear() - 3);
        break;
      default:
        console.log("Invalid range");
        return;
    }

    const newFrom = from.toISOString().split("T")[0];

    setInterval(computedInterval);
    setUnit(computedUnit);
    setFilter(range);
    setToDate(to);
    setFromDate(newFrom);

    try {
      const instrument_key = "NSE_EQ|INE002A01018";
      let response;
      if (range === "1D") {
        response = await axios.get(
          `http://localhost:5000/api/v1/intraday/${instrument_key}/${computedUnit}/${computedInterval}`
        );
      } else {
        response = await axios.get(
          `http://localhost:5000/api/v1/candle-data/${instrument_key}/${computedUnit}/${computedInterval}/${to}/${newFrom}`
        );
      }
      setCandles(response.data);
      // console.log(candles)
    } catch (error) {
      console.log("Fetching error", error);
    }
  };

  useEffect(() => {
    setGranularity(filter);
    const socket = io("http://localhost:5000");

    socket.on("liveData", (feed) => {
      const instrumentKey = Object.keys(feed.feeds)[0];
      const ltpData = feed.feeds[instrumentKey]?.fullFeed?.indexFF?.marketOHLC;
      console.log(ltpData)
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h1>Interval</h1>
      <div>
        {units.map((unit) => {
          return (
            <button
              key={unit.id}
              style={{
                marginRight: "4px",
                backgroundColor: unit.value === filter ? "#005f73" : "#008CBA",
                color: "#fff",
                border: "none",
                borderRadius: "2px",
                padding: "6px 7px",
              }}
              onClick={() => setGranularity(unit.value)}
            >
              {unit.value}
            </button>
          );
        })}
        <CandleChart data={candles} range={filter} />
      </div>
    </div>
  );
}

export default App;
