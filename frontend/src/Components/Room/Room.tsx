import React from "react";
import NavBar from "../NavBar/NavBar";
import FormCard from "./FormCard/FormCard";
import ContentCard from "./ContentCard/ContentCard";
import SearchBar from "./SearchBar/SearchBar";

const Room = () => {
  document.title = "CODEWEAVE | Rooms";

  return (
    <main className="min-h-screen w-full bg-[#121212] flex flex-col">
      <div className="pt-5 shrink-0">
        <NavBar />
      </div>

      <div className="pt-5 px-6 lg:px-12 shrink-0">
        <SearchBar />
      </div>

      <div className="flex-1 w-full px-6 lg:px-12 py-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ContentCard />

          <FormCard />
        </div>
      </div>
    </main>
  );
};

export default Room;
