import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ArenaNavBar from "./ArenaNavBar/ArenaNavBar";
import ArenaCodeArea from "./ArenaCodeArea/ArenaCodeArea";
import AreanSideBar from "./AreanSideBar/ArenaSideBar";

export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
};

const Arena = () => {
  const { name, id } = useParams();

  const [tree, setTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);

  document.title = `Codeweave | Room - ${name}`;

  // 🔥 update file content inside tree
  const updateFileContent = (
    nodes: FileNode[],
    fileId: string,
    content: string
  ): FileNode[] => {
    return nodes.map((node) => {
      if (node.id === fileId) {
        return { ...node, content };
      }
      if (node.children) {
        return {
          ...node,
          children: updateFileContent(node.children, fileId, content),
        };
      }
      return node;
    });
  };

  return (
    <div className="h-screen w-screen bg-[#121212] flex flex-col">

      {/* NAVBAR */}
      <div className="shrink-0">
        <ArenaNavBar name={`${name}`} id={`${id}`} />
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <AreanSideBar
          tree={tree}
          setTree={setTree}
          onFileSelect={(file: FileNode) => setActiveFile(file)} // ✅ typed
        />

        {/* EDITOR */}
        <div className="flex-1">
          <ArenaCodeArea
            file={activeFile}
            onChange={(value) => {
              if (!activeFile) return;

              // update tree
              setTree((prev) =>
                updateFileContent(prev, activeFile.id, value)
              );

              // keep active file synced
              setActiveFile((prev) =>
                prev ? { ...prev, content: value } : prev
              );
            }}
          />
        </div>

      </div>
    </div>
  );
};

export default Arena;