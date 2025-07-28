import { BrowserRouter, Routes, Route } from "react-router-dom";
import StockDetails from "./pages/StockDetails";
import Login from "./pages/Login";
import "./App.css";
import TradingViewWidget from "./pages/TradingViewWidget";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StockDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chart" element={<TradingViewWidget />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
