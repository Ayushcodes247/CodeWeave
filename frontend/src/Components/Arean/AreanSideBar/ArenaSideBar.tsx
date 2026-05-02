import React, { useState } from "react";
import {
    FiChevronRight,
    FiChevronDown,
    FiFolder,
    FiFile,
    FiPlus,
    FiTrash2,
    FiSidebar,
    FiX,
} from "react-icons/fi";
import { motion } from "motion/react";

type FileNode = {
    id: string;
    name: string;
    type: "file" | "folder";
    children?: FileNode[];
    content?: string; // 🔥 important
};

type Props = {
    tree: FileNode[];
    setTree: React.Dispatch<React.SetStateAction<FileNode[]>>;
    onFileSelect: (file: FileNode) => void;
};

const AreanSideBar = ({ tree, setTree, onFileSelect }: Props) => {
    const [activeInput, setActiveInput] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState("");

    const [isOpen, setIsOpen] = useState(true);
    const [width, setWidth] = useState(260);

    // 🧠 RESIZE
    const handleMouseDown = () => {
        const handleMouseMove = (e: MouseEvent) => {
            setWidth(Math.max(200, Math.min(400, e.clientX)));
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    // 🔥 CREATE FILE
    const addFile = (parentId: string | null) => {
        if (!newFileName.trim()) {
            setActiveInput(null);
            return;
        }

        const newFile: FileNode = {
            id: Date.now().toString(),
            name: newFileName,
            type: "file",
            content: "", // 🔥 important
        };

        const addRecursive = (nodes: FileNode[]): FileNode[] =>
            nodes.map((node) => {
                if (node.id === parentId && node.type === "folder") {
                    return {
                        ...node,
                        children: [...(node.children || []), newFile],
                    };
                }
                return node.children
                    ? { ...node, children: addRecursive(node.children) }
                    : node;
            });

        setTree(parentId === null ? [...tree, newFile] : addRecursive(tree));

        // 🔥 auto open new file
        onFileSelect(newFile);

        setNewFileName("");
        setActiveInput(null);
    };

    // ❌ DELETE
    const deleteNode = (id: string) => {
        const deleteRecursive = (nodes: FileNode[]): FileNode[] =>
            nodes
                .filter((n) => n.id !== id)
                .map((n) => ({
                    ...n,
                    children: n.children ? deleteRecursive(n.children) : undefined,
                }));

        setTree(deleteRecursive(tree));
    };

    // 🌳 TREE ITEM
    const TreeItem = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
        const [open, setOpen] = useState(false);
        const paddingLeft = 12 + level * 12;

        return (
            <div>
                <motion.div
                    whileHover={{ backgroundColor: "#2a2d2e" }}
                    className="group flex items-center justify-between py-1 px-2 text-sm"
                    style={{ paddingLeft }}
                >
                    <div
                        className="flex items-center gap-2 text-[#ccc] cursor-pointer"
                        onClick={() => {
                            if (node.type === "folder") {
                                setOpen(!open);
                            } else {
                                onFileSelect(node); // 🔥 open file
                            }
                        }}
                    >
                        {node.type === "folder" &&
                            (open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />)}

                        {node.type === "folder" ? (
                            <FiFolder className="text-yellow-400" size={14} />
                        ) : (
                            <FiFile size={14} />
                        )}

                        <span>{node.name}</span>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                        {node.type === "folder" && (
                            <FiPlus
                                size={14}
                                className="text-[#aaa] hover:text-white cursor-pointer"
                                onClick={() =>
                                    setActiveInput((prev) => (prev === node.id ? null : node.id))
                                }
                            />
                        )}
                        <FiTrash2
                            size={14}
                            className="text-[#aaa] hover:text-red-400 cursor-pointer"
                            onClick={() => deleteNode(node.id)}
                        />
                    </div>
                </motion.div>

                {/* INPUT */}
                {activeInput === node.id && (
                    <div style={{ paddingLeft: paddingLeft + 20 }}>
                        <input
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addFile(node.id)}
                            onBlur={() => setActiveInput(null)}
                            className="bg-[#333] text-white text-xs px-2 py-1 rounded w-[140px]"
                            placeholder="file.ts"
                        />
                    </div>
                )}

                {/* CHILDREN */}
                {open &&
                    node.children?.map((child) => (
                        <TreeItem key={child.id} node={child} level={level + 1} />
                    ))}
            </div>
        );
    };

    return (
        <>
            {/* 🔥 GLOBAL TOGGLE */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed left-2 top-20 z-[999] text-white bg-[#1e1e1e] p-2 rounded shadow-md hover:bg-[#2a2a2a]"
                >
                    <FiSidebar />
                </button>
            )}

            <motion.div
                animate={{ width: isOpen ? width : 0 }}
                className="h-full bg-[#1e1e1e] border-r border-[#2a2a2a] flex flex-col relative overflow-hidden shrink-0"
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-3 py-2 text-xs text-[#888] uppercase">
                    Explorer

                    <div className="flex gap-2">
                        <FiPlus
                            className="cursor-pointer hover:text-white"
                            onClick={() =>
                                setActiveInput((prev) => (prev === "root" ? null : "root"))
                            }
                        />
                        <FiX
                            className="cursor-pointer hover:text-red-400"
                            onClick={() => setIsOpen(false)}
                        />
                    </div>
                </div>

                {/* ROOT INPUT */}
                {activeInput === "root" && (
                    <div className="px-3">
                        <input
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addFile(null)}
                            onBlur={() => setActiveInput(null)}
                            className="bg-[#333] text-white text-xs px-2 py-1 rounded w-full"
                            placeholder="new file..."
                        />
                    </div>
                )}

                {/* TREE */}
                <div className="flex-1 overflow-y-auto">
                    {tree.map((node) => (
                        <TreeItem key={node.id} node={node} />
                    ))}
                </div>

                {/* RESIZE */}
                {isOpen && (
                    <div
                        onMouseDown={handleMouseDown}
                        className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-[#444]"
                    />
                )}
            </motion.div>
        </>
    );
};

export default AreanSideBar;