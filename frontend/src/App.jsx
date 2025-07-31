import { useEffect, useState } from "react";
import "./App.css";
import StockDetails from "./pages/StockDetails";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/stock-details" element={<StockDetails />} />
        <Route path="/auth/callback" element={<AuthCallback/>} />
      </Routes>
      {/* <StockDetails />
      <Login /> */}
    </div>
  );
}

export default App;
