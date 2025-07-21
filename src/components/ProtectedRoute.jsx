import { Navigate } from "react-router-dom";

// This is our special ProtectedRoute component.
// We give it:
// 1. userRole - "admin", "customer"
// 2. allowedRoles - "admin"
// 3. children - admin panel if allowed
export default function ProtectedRoute({ userRole, allowedRoles, children }) {
  //If no userRole (means user is NOT logged in)
  if (userRole === null) {
    return <Navigate to="/login" replace />;
  }
 
  // we send them back to the homepage (they're not allowed to see this page).
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
//If the user is logged in AND has permission, 
  // we show them the page they are trying to go to.
  return children;
}
