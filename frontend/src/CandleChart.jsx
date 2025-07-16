import React from "react";
import Chart from "react-apexcharts";

const CandleChart = ({ data, range = "1D" }) => {
  const candleData = Array.isArray(data?.data) ? data.data : [];

  const sortedData = [...candleData].sort(
    (a, b) => new Date(a[0]) - new Date(b[0])
  );

  // console.log("sorted:", sortedData)

  const filteredData = sortedData.filter((item) => {
    const day = new Date(item[0]).getDay();
    return day !== 0 && day !== 6;
  });

  const series = [
    {
      data: filteredData.map((item) => ({
        x: new Date(item[0]),
        y: [item[1], item[2], item[3], item[4]],
      })),
    },
  ];

  // Chart title based on range
  const titleMap = {
    "1D": "10-min Candles - Today",
    "1M": "Daily Candles - Last Month",
    "1Y": "Weekly Candles - Last Year",
  };

  const options = {
    chart: {
      type: "candlestick",
      height: 350,
    },
    title: {
      text: titleMap[range] || "Candlestick Chart",
      align: "left",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <Chart options={options} series={series} type="candlestick" height={500} />
  );
};

export default CandleChart;
