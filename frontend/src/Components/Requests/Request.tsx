import React from "react";
import NavBar from "../NavBar/NavBar";

const Request = () => {
  document.title = "CODEWEAVE | Requests."
  return (
    <main className="min-h-screen w-full bg-[#121212] flex flex-col">
      <div className="pt-5 shrink-0">
        <NavBar />
      </div>
    </main>
  );
};

export default Request;
