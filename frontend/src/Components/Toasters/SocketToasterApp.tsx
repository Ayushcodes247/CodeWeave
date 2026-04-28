import toast from "react-hot-toast";
import { motion } from "motion/react";

export const socketToastApp = (message: string) => {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="relative overflow-hidden flex items-center gap-3 px-5 py-4
        rounded-xl bg-[#1E1E1E] border border-[#3a3a3a]
        shadow-[0_8px_30px_rgba(0,0,0,0.4)]
        text-white w-[360px]"
      >
        <div className="absolute left-0 top-0 h-full w-[4px] bg-[#D4FB54]" />
        <p className="text-sm leading-relaxed flex gap-5 text-[#e6e6e6] break-words pr-2">
          <span>⚡</span>
          {message}
        </p>
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 8, ease: "linear" }}
          className="absolute bottom-0 left-0 h-[3px] bg-[#D4FB54]"
        />
      </motion.div>
    ),
    {
      position: "top-right",
      duration: 7500,
    },
  );
};
