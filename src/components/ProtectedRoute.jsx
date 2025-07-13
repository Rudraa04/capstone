import React from "react";
//lets us move the user to another page
import { Navigate } from "react-router-dom";

// This is our special ProtectedRoute component.
// We give it:
// 1. userRole → who the user is (like "admin", "customer")
// 2. allowedRoles → who is allowed to go in (like only "admin")
// 3. children → the actual page we want to show if allowed
export default function ProtectedRoute({ userRole, allowedRoles, children }) {
  // If no userRole (means user is NOT logged in), we send them to the login page.
  if (userRole === null) {
    return <Navigate to="/login" replace />;
  }

  //  If the user's role is NOT in the list of allowedRoles (like not an admin), 
  // we send them back to the homepage (they're not allowed to see this page).
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
//If the user is logged in AND has permission, 
  // we show them the page they are trying to go to.
  return children;
}
