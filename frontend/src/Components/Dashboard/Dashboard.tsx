import React from "react";
import { useAppDispatch } from "../../services/hook";
import { logoutUserOne , logoutUserAll } from "../../features/authentication/authThunk";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar/NavBar";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  document.title = "CODEWEAVE | Dashboard";

  return (
    <main className="min-h-screen w-full bg-[#121212] flex flex-col">
      <div className="pt-5 shrink-0">
        <NavBar/>
      </div>
    </main>
  );
};

export default Dashboard;
