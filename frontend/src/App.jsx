import { BrowserRouter, Routes, Route } from "react-router-dom";
import StockDetails from "./pages/StockDetails";
import Login from "./pages/Login";
import "./App.css";
import TradingViewWidget from "./pages/TradingViewWidget";
import AuthCallback from "./pages/AuthCallback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/stock-details" element={<StockDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chart" element={<TradingViewWidget />} />
        <Route path="/auth/callback" element={<AuthCallback/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
