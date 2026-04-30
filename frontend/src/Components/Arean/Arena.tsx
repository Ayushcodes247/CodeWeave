import React from "react";
import { useParams } from "react-router-dom";
import ArenaNavBar from "./ArenaNavBar/ArenaNavBar";
import ArenaCodeArea from "./ArenaCodeArea/ArenaCodeArea";

const Arena = () => {
  const { name, id } = useParams();
  document.title = `Codeweave | Room - ${name}`;
  return <div className="h-screen w-screen bg-[#121212]">
    <ArenaNavBar name={`${name}`} id={`${id}`} />
    <ArenaCodeArea/>
  </div>;
};

export default Arena;
