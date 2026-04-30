import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../../services/hook";
import { successToast } from "../../Toasters/successToaster";
import { errorToast } from "../../Toasters/ErroToaster";
import { profileHandler } from "../../../features/authentication/authThunk";
import { motion, AnimatePresence } from "motion/react";
import { FiCopy } from "react-icons/fi";

type ProfileDataType = {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
};

const ProfileCard = () => {
  const [userData, setUserData] = useState<ProfileDataType>({
    _id: "",
    username: "",
    email: "",
    profilePic: "",
  });

  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        const response = await dispatch(profileHandler()).unwrap();

        if (response.success) {
          successToast(response.message);
        }

        if (isMounted) {
          setUserData(response.user);
        }
      } catch (error: any) {
        errorToast(error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const copyHandler = (text: string) => {
    navigator.clipboard.writeText(text);
    successToast("Copied to clipboard");
  };

  return (
    <div className="w-full flex justify-center px-10 items-center py-10">
      <AnimatePresence>
        {!isLoading && userData._id && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative w-[520px] rounded-md p-[1.5px] overflow-hidden flex"
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background:
                  "linear-gradient(270deg, #00c3ff, #00ffcc, #7cff00)",
                backgroundSize: "400% 400%",
              }}
            />

            <div className="relative bg-[#020202] rounded-md w-full p-6 flex items-center gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative w-24 h-24 rounded-full p-[2px] overflow-hidden shrink-0"
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    background:
                      "linear-gradient(270deg, #00c3ff, #00ffcc, #7cff00)",
                    backgroundSize: "400% 400%",
                  }}
                />

                <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                  <img
                    src={userData.profilePic}
                    alt="profile"
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
              </motion.div>

              <div className="flex flex-col gap-3 flex-1">
                <p className="text-white text-xl font-semibold uppercase tracking-wide cursor-pointer">
                  {userData.username}
                </p>

                <div className="flex items-center justify-between bg-[#111] px-3 py-2 rounded cursor-pointer">
                  <p className="text-sm text-[#aaa] truncate">
                    {userData.email}
                  </p>
                  <button
                    onClick={() => copyHandler(userData.email)}
                    className="text-[#888] hover:text-white cursor-pointer"
                  >
                    <FiCopy />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-[#111] px-3 py-2 rounded cursor-pointer">
                  <p className="text-xs text-[#777] truncate">{userData._id}</p>
                  <button
                    onClick={() => copyHandler(userData._id)}
                    className="text-[#888] hover:text-white cursor-pointer"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-[520px] rounded-md p-[1.5px] overflow-hidden flex"
          >
            <div className="relative bg-[#020202] rounded-md w-full p-6 flex items-center gap-6 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-[#111]" />

              <div className="flex flex-col gap-3 flex-1">
                <div className="h-5 w-32 bg-[#111] rounded" />
                <div className="h-8 w-full bg-[#111] rounded" />
                <div className="h-8 w-full bg-[#111] rounded" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileCard;
