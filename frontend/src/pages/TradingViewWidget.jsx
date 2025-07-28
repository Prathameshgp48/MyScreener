import React, { useEffect, useState } from 'react';
import NseChart from './NseChart';
import axios from 'axios';

function TradingView() {
  const [ohlcData, setOhlcData] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('2025-06-27');
  const [endDate, setEndDate] = useState('2025-07-27');
  const [loading, setLoading] = useState(false);

  const instrumentKey = 'NSE_EQ|INE848E01016'; // Replace with your actual key

  // Fetch data when dates change
  useEffect(() => {
    if (!startDate || !endDate) return;

    async function fetchData() {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/candle-data/${instrumentKey}/days/1/${endDate}/${startDate}`
        );
        const json = response.data;

        if (Array.isArray(json.data)) {
          const sortedData = [...json.data].sort((a, b) => new Date(a[0]) - new Date(b[0]));
          const formattedData = sortedData.map((d) => ({
            time: d[0].slice(0, 10),
            open: d[1],
            high: d[2],
            low: d[3],
            close: d[4],
          }));
          setOhlcData(formattedData);
          setError(null);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError('Could not load chart data.');
        setOhlcData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Start Date:{' '}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate}
          />
        </label>{' '}
        <label>
          End Date:{' '}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </label>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Loading chart...</div>}
      {!loading && ohlcData.length > 0 && <NseChart ohlcData={ohlcData} />}
    </div>
  );
}

export default TradingView;
