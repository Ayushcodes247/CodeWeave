import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Components/Home/Home";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import ProtectedRoutes from "./features/authentication/ProtectedRoutes";
import Dashboard from "./Components/Dashboard/Dashboard";
import { useAppDispatch, useAppSelector } from "./services/hook";
import { autoLogin } from "./features/authentication/authThunk";
import Room from "./Components/Room/Room";
import Profile from "./Components/Profile/Profile";
import Request from "./Components/Requests/Request";
import { socketManager } from "./services/socket";
import { Toaster } from "react-hot-toast";
import { socketToastApp } from "./Components/Toasters/SocketToasterApp";

const App = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.authentication.user);

  useEffect(() => {
    dispatch(autoLogin());
  }, [dispatch]);

  useEffect(() => {
    if (!user?._id) return;

    socketManager.connect(user._id);

    socketManager.on("request:new", (data) => {
      console.log("socket data",data);
      socketToastApp(``);
    })
  }, [user]);

  return (
    <>
      <Toaster />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/main" element={<Dashboard />} />
          <Route path="/room" element={<Room />} />
          <Route path="/request" element={<Request />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
