import React, { useState } from "react";
import { FaSearch, FaUserPlus, FaCopy } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../services/hook";
import { search } from "../../../features/rooms/roomThunk";

const SearchBar = () => {
  const [clicked, setIsClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [ requestClicked, setRequestClicked ] = useState<boolean>(false);
  const {
    setValue,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      roomId: "",
    },
  });

  const dispatch = useAppDispatch();

  return (
    <div className="w-full px-4">
      {/* Top Input */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="relative max-w-md" onClick={() => setIsClicked(true)}>
          <input
            type="text"
            placeholder="Enter Room ID"
            readOnly
            className="w-full bg-[#1E1E1E] text-[#ECECEC] px-4 py-2 pr-10 rounded-md outline-none
            shadow-inner shadow-[inset_2px_2px_6px_#141414,inset_-2px_-2px_6px_#2a2a2a]"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]" />
        </div>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {clicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0e100f63] backdrop-blur-xl flex items-start justify-center pt-28 z-50"
            onClick={() => setIsClicked(false)}
          >
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[92%] max-w-3xl bg-[#1b1b1b] rounded-xl p-6 shadow-xl flex flex-col gap-5"
            >
              {/* Form */}
              <form
                onSubmit={handleSubmit(async (data) => {
                  try {
                    setLoading(true);
                    setRoom(null);

                    const response = await dispatch(search(data)).unwrap();
                    setRoom(response.room);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setLoading(false);
                    reset();
                  }
                })}
                className="relative"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter Room ID"
                  className="w-full bg-[#272727] text-white px-4 py-3 pr-10 rounded-md outline-none"
                  {...register("roomId", {
                    required: "Room ID is required",
                    maxLength: {
                      value: 24,
                      message: "Max length is 24 characters",
                    },
                  })}
                  onChange={(e) => setValue("roomId", e.target.value)}
                />

                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] cursor-pointer"
                >
                  <FaSearch />
                </button>
              </form>

              {/* Error */}
              {errors.roomId && (
                <p className="text-red-400 text-sm">{errors.roomId.message}</p>
              )}

              {/* Loading */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      layout
                      className="w-full max-w-[20rem] min-h-56 rounded-xl bg-[#1E1E1E] shadow-xl p-5 flex flex-col justify-between animate-pulse"
                    >
                      <div className="size-6 rounded-full bg-[#2a2a2a]" />
                      <div className="flex flex-col gap-3 mt-6">
                        <div className="h-4 w-3/4 bg-[#2a2a2a] rounded" />
                        <div className="h-4 w-1/2 bg-[#2a2a2a] rounded" />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {!loading && room && (
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      layout
                      whileHover={{ scale: 1.03, y: -4 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="w-full max-w-[20rem] min-h-56 rounded-xl bg-[#1E1E1E] shadow-xl p-5 flex flex-col justify-between"
                    >
                      {/* Top */}
                      <div className="flex justify-between items-center">
                        <div
                          className={`px-3 py-1 text-xs rounded-full ${
                            room.mode === "solo"
                              ? "bg-[#2e7d32]"
                              : "bg-[#1565c0]"
                          } text-white`}
                        >
                          {room.mode.toUpperCase()}
                        </div>

                        <p className="text-xs text-[#888]">
                          {new Date(room.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-2 mt-4">
                        <p className="text-white text-lg font-semibold">
                          {room.roomName}
                        </p>

                        <p className="text-sm text-[#aaa]">
                          Owner:{" "}
                          <span className="text-white">{room.ownerName}</span>
                        </p>

                        <p className="text-sm text-[#aaa] break-all">
                          Room ID: {room._id}
                        </p>
                      </div>

                      {/* Bottom Info */}
                      <div className="flex flex-col gap-1 mt-3 text-xs text-[#777]">
                        <p>
                          Created: {new Date(room.createdAt).toLocaleString()}
                        </p>
                        <p>
                          Last Active:{" "}
                          {new Date(room.lastActivatedAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-[#777]">Active Room</p>

                        <div className="flex items-center gap-3">
                          {/* Copy */}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() =>
                              navigator.clipboard.writeText(room._id)
                            }
                            className="p-2 rounded-md bg-[#232323] text-[#aaa]
                            hover:text-white hover:shadow-[0_0_10px_#D6FE50]
                            transition-all duration-200"
                          >
                            <FaCopy size={14} />
                          </motion.button>

                          {/* Request Join */}
                          <motion.button
                          onClick={() => setRequestClicked(true)}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md
                            bg-[#D6FE50] text-black text-sm font-medium
                            shadow-md hover:shadow-[0_0_12px_#D6FE50]
                            transition-all duration-200"
                          >
                            <FaUserPlus size={12} />
                            Request Join
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
