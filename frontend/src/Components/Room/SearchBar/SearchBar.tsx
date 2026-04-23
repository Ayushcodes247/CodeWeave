import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";

type Room = {
  id: string;
  name: string;
  color: string;
};

const SearchBar = () => {
  const [clicked, setIsClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="relative max-w-md" onClick={() => setIsClicked(true)}>
          <input
            type="text"
            placeholder="Enter Room ID"
            readOnly
            className="w-full bg-[#1E1E1E] text-[#ECECEC] px-4 py-2 pl-10 rounded-md outline-none
            shadow-inner shadow-[inset_2px_2px_6px_#141414,inset_-2px_-2px_6px_#2a2a2a]"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
        </div>
      </div>

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
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search rooms..."
                  className="w-full bg-[#272727] text-white px-4 py-3 pl-10 rounded-md outline-none"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
              </div>

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

              <AnimatePresence>
                {!loading && (
                  <motion.div
                    className="flex flex-wrap gap-4 justify-center"
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
                          delay:  0.05,
                        }}
                        className="w-full max-w-[20rem] min-h-56 rounded-xl bg-[#1E1E1E] shadow-xl p-5 flex flex-col justify-between"
                      >
                        <div className="flex flex-col gap-3 mt-6">
                          <p className="text-white text-lg font-medium">
                          </p>
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
