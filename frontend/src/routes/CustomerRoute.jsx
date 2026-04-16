import React from "react";
import { Navigate } from "react-router-dom";

export default function CustomerRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Only customer allowed
  if (user.role !== "customer") {
    return <Navigate to="/" replace />;
  }

  return children;
}