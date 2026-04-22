import React from "react";
import NavBar from "../NavBar/NavBar";
import FormCard from "./FormCard/FormCard";
import ContentCard from "./ContentCard/ContentCard";

const Room = () => {
  document.title = "CODEWEAVE | Rooms";

  return (
    <main className="min-h-screen w-full bg-[#121212] flex flex-col">
      <div className="pt-5 shrink-0">
        <NavBar />
      </div>

      <div className="flex-1 w-full flex">
        <div className="w-full max-w-440 mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-wrap justify-center gap-8">
            <FormCard/>
            <ContentCard/>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Room;
