import React from "react";
import { motion } from "motion/react";

const ContentCard = () => {
  const color = Math.floor((1 + Math.random() * 10)).toString();

  return (
    <div className="flex-none">
      <motion.div
        layout
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-[20rem] min-h-56 rounded-xl bg-[#1E1E1E] shadow-xl p-5 flex flex-col justify-between"
      >
        <div className={`size-6 rounded-full bg-[#00ff${color}]`} />
        <div className="flex flex-col gap-3">
          
        </div>
      </motion.div>
    </div>
  );
};

export default ContentCard;
