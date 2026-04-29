import React from "react";
import NavBar from "../NavBar/NavBar";
import Owner from "./Owner/Owner";
import Requester from "./Requested/Request";

const Request = () => {
  document.title = "CODEWEAVE | Requests.";

  return (
    <main className="min-h-screen w-full bg-[#121212] flex flex-col">
      <div className="pt-5 shrink-0">
        <NavBar />
      </div>

      <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 px-4 lg:px-8 py-6">
        <div className="flex-1 bg-[#1E1E1E] rounded-xl p-4 shadow-lg">
          <Owner />
        </div>

        <div className="flex-1 bg-[#1E1E1E] rounded-xl p-4 shadow-lg">
          <Requester />
        </div>
      </div>
    </main>
  );
};

export default Request;
