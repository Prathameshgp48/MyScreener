import React from "react";
// import axios from "axios";

function Login() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/api/v1/login";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>
        Welcome to Stock Screener
      </h1>
      <p style={{ marginBottom: "20px", color: "#555" }}>
        Login securely using your Upstox account to continue
      </p>
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          backgroundColor: "#7A26CE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        Login with Upstox
        <span
          style={{
            display: "inline-block",
            height: "25px",
            width: "25px",
            paddingLeft: "8px",
          }}
        >
          <img
            src="./upstox.png"
            alt="upstox"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        </span>
      </button>
    </div>
  );
}

export default Login;
