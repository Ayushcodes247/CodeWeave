import toast from "react-hot-toast";
import { motion } from "motion/react";

export const successToast = (message: string) => {
  toast.custom(
    (t) => (
      <motion.div
        onMouseEnter={() => toast.dismiss(t.id)}
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative overflow-hidden flex items-center gap-3 px-5 h-[70px] rounded-xl
        bg-[#1E1E1E] border border-[#D4FB54] shadow-2xl text-white w-[360px]"
      >
        <div className="w-2 h-2 bg-[#D4FB54] rounded-full" />

        <p className="text-sm">{message}</p>

        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="absolute bottom-0 left-0 h-[3px] bg-[#D4FB54]"
        />
      </motion.div>
    ),
    {
      position: "top-right",
      duration: 4500, 
    },
  );
};
