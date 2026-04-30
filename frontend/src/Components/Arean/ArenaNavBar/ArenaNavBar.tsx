import React, { useState } from "react";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { TbDoorExit } from "react-icons/tb";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

type Prop = {
    name: string;
    id: string;
};

const ArenaNavBar = (props: Prop) => {
    const [clicked, setClicked] = useState<boolean>(false);

    const handleLogoutOne = () => {
        console.log("Logout from this room");
        setClicked(false);
    };

    const handleLogoutAll = () => {
        console.log("Logout from all sessions");
        setClicked(false);
    };

    return (
        <>
            {/* NAVBAR */}
            <div className="relative w-full h-14 px-7 flex items-center justify-between bg-[#1E1E1E] shadow-lg">

                {/* LEFT */}
                <Link
                    to="/room"
                    className="text-[#aaa] hover:text-white transition text-2xl"
                >
                    <FaRegArrowAltCircleLeft />
                </Link>

                {/* CENTER */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
                    <h1 className="text-[#F1F1F1] text-md font-semibold uppercase tracking-wide">
                        {props.name}
                    </h1>
                    <p className="text-[#6F7170] text-xs">Room ID: {props.id}</p>
                </div>

                {/* RIGHT */}
                <button
                    onClick={() => setClicked(true)}
                    className="w-8 h-8 bg-[#ff1c1c] hover:bg-red-400 transition text-white rounded-full flex justify-center items-center shadow-md"
                >
                    <TbDoorExit className="text-lg" />
                </button>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {clicked && (
                    <motion.div
                        className="fixed inset-0 bg-[#00000080] backdrop-blur-md flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setClicked(false)}
                    >
                        {/* BOX */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 40 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-[90%] max-w-sm bg-[#1E1E1E] rounded-xl p-6 flex flex-col gap-5 shadow-xl"
                        >
                            <h2 className="text-white text-lg font-semibold text-center">
                                Logout Options
                            </h2>

                            <p className="text-sm text-[#aaa] text-center">
                                Choose how you want to leave
                            </p>

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-col gap-3 mt-2">
                                <button
                                    onClick={handleLogoutOne}
                                    className="w-full py-2 bg-yellow-500/20 text-yellow-400 rounded-md hover:bg-yellow-500/30 transition"
                                >
                                    Logout from this room
                                </button>

                                <button
                                    onClick={handleLogoutAll}
                                    className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                >
                                    Logout from all sessions
                                </button>

                                <button
                                    onClick={() => setClicked(false)}
                                    className="w-full py-2 bg-[#333] text-white rounded-md hover:bg-[#444] transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ArenaNavBar;