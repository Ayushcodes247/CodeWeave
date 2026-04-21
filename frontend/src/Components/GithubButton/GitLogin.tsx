import React from "react";
import { ImGithub } from "react-icons/im";

const GitLogin = () => {
  return (
    <button className="flex items-center cursor-pointer shadow-xl justify-center gap-4 py-4 text-md rounded-xl font-semibold text-[#F7F9F8] bg-[#202221]">
      <ImGithub className="size-6" />
      <span className="text-md font-semibold font-[ttregular]">
        Continue with Github
      </span>
    </button>
  );
};

export default GitLogin;
