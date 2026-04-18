import React from "react";
import { useAppDispatch } from "../../services/hook";
import { logoutUserOne , logoutUserAll } from "../../features/authentication/authThunk";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  document.title = "Code weave | Dashboard";

  return <div>Dashboard
    <button onClick={async () => {
      const response  = await dispatch(logoutUserOne());
      if(response.payload){
        navigate("/login");
      }
      response.payload.message
    }}>Logout</button>
     <button onClick={async () => {
      const response  = await dispatch(logoutUserAll());
      if(response.payload){
        navigate("/login");
      }
      response.payload.message
    }}>Logout All device</button>
  </div>;
};

export default Dashboard;
