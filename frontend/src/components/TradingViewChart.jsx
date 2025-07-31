import {
  createChart,
  CrosshairMode,
  CandlestickSeries,
} from "lightweight-charts";
import React, { useEffect, useRef, useMemo } from "react";

const TradingViewChart = ({ data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candleSeriesRef = useRef();

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [data]);

  const tradingData = useMemo(() => {
    return sortedData.map((d) => ({
      time: Math.floor(new Date(d[0]).getTime() / 1000),
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
    }));
  }, [sortedData]);

  useEffect(() => {
    if (!tradingData || tradingData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: "solid", color: "white" },
        textColor: "black",
      },
      grid: {
        vertLines: { color: "#eee" },
        horLines: { color: "#eee" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candlestickSeries.setData(tradingData);
    candleSeriesRef.current = candlestickSeries;

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [tradingData]);

  return (
    <div>
      <div
        ref={chartContainerRef}
        style={{ position: "relative", width: "100%", height: "400px" }}
      >
        {(!data || data.length === 0) && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#888",
            }}
          >
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingViewChart;
