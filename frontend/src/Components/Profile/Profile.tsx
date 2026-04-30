import React from "react";
import NavBar from "../NavBar/NavBar";
import ProfileCard from "./ProfileCard/ProfileCard";
import SettingCard from "./SettingCard/SettingCard";

const Profile = () => {
  document.title = "CODEWEAVE | Profile";

  return (
    <main className="min-h-screen w-full bg-[#121212] flex flex-col">
      <div className="pt-5 shrink-0">
        <NavBar />
      </div>

      <div className="flex flex-1 justify-center items-start px-6 py-10">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex justify-center md:justify-start">
            <ProfileCard />
          </div>

          <div className="flex-1 flex justify-center md:justify-end">
            <SettingCard />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
