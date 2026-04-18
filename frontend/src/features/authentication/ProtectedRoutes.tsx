import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../services/hook";

const ProtectedRoutes = () => {
  const { isAuthenticated, authChecked } = useAppSelector(
    (state: any) => state.authentication,
  );

  if (!authChecked) {
    return <div>Loading....</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
