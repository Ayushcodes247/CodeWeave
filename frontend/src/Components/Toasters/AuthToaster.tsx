import toast from "react-hot-toast";
import { motion } from "motion/react";

type User = {
  _id: string;
  username: string;
  profilePic: string;
};

export const ShowAuthToaster = (user: User, message : string) => {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -60, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative overflow-hidden flex items-center gap-4 px-6 h-[70px] rounded-xl
        bg-[#1E1E1E] border border-[#2a2a2a] shadow-2xl
        text-white w-[380px]"
      >
        {/* Avatar */}
        <img
          src={user.profilePic}
          alt="profile"
          className="w-12 h-12 rounded-full object-cover border border-[#333]"
        />

        {/* Text */}
        <div className="flex flex-col justify-center">
          <p className="text-base font-semibold uppercase tracking-wide leading-none">
            {user.username}
          </p>
          <p className="text-sm text-[#aaa] leading-none">
            {message}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 9, ease: "linear" }}
          className="absolute bottom-0 left-0 h-[3px] bg-[#defd78]"
        />
      </motion.div>
    ),
    {
      position: "top-right",
      duration: 8000,
    },
  );
};
