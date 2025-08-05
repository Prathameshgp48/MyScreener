import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      navigate("/login");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true; // prevent second run

    const generateToken = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/login/generate-token?code=${code}`
        );

        console.log("Full response:", response.data);

        const { jwtToken, message } = response.data;

        if (jwtToken) {
          sessionStorage.setItem("jwt", jwtToken);
          setLoading(false);
          navigate("/stock-details");
        } else {
          console.error("Login failed:", message || "No token received");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error during token generation:", err);
        navigate("/login");
      }
    };

    generateToken();
  }, [navigate]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-b-4 border-[#7A26CE] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="flex items-center justify-center h-screen">
      Login Successful! Redirecting...
    </div>
  );
}

export default AuthCallback;
