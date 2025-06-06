import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ userRole, allowedRoles, children }) {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
