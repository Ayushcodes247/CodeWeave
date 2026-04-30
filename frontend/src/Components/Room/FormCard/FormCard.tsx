import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaPlusCircle, FaCopy } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../services/hook";
import { create } from "../../../features/rooms/roomThunk";
import { errorToast } from "../../Toasters/ErroToaster";
import { successToast } from "../../Toasters/successToaster";

type FormValues = {
  roomName: string;
  mode: "solo" | "team";
  maxMembers: number;
};

const FormCard = () => {
  const [clicked, setClicked] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const {
    register,
    setValue,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      roomName: "",
      mode: "solo",
      maxMembers: 1,
    },
  });

  const selectedMode = watch("mode");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (selectedMode === "solo") {
      setValue("maxMembers", 1);
    }
  }, [selectedMode, setValue]);

  useEffect(() => {
    if (!inviteCode) return;

    const timer = setTimeout(() => {
      setInviteCode(null);
      setTimeout(() => setClicked(false), 300);
    }, 10000);

    return () => clearTimeout(timer);
  }, [inviteCode]);

  return (
    <div className="flex-none">
      <motion.div
        onClick={() => setClicked(true)}
        layout
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-full h-[180px] rounded-xl p-[1.5px] overflow-hidden"
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background: "linear-gradient(270deg, #170C79, #EFE3CA, #56B6C6)",
            backgroundSize: "400% 400%",
          }}
        />

        <div className="relative w-full h-full rounded-xl bg-[#1E1E1E] flex items-center justify-center">
          <FaPlusCircle className="size-12 text-[#c4c4c4]" />
        </div>
      </motion.div>

      <AnimatePresence>
        {clicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0e100f63] backdrop-blur-xl flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-[92%] max-w-lg min-h-80 rounded-xl p-[1.5px] overflow-hidden"
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
                    "linear-gradient(270deg, #170C79, #EFE3CA, #56B6C6)",
                  backgroundSize: "400% 400%",
                }}
              />

              <div className="relative bg-[#1b1b1b] rounded-xl p-6 shadow-xl flex flex-col gap-4">
                <h2 className="text-xl text-white flex justify-between items-center">
                  Create Room
                  <IoMdCloseCircle
                    className="size-9 text-red-500 cursor-pointer"
                    onClick={() => setClicked(false)}
                  />
                </h2>

                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleSubmit(async (data) => {
                    try {
                      const sanitized = {
                        ...data,
                        maxMembers: Number(data.maxMembers),
                      };

                      const res = await dispatch(create(sanitized)).unwrap();

                      successToast(res.message);
                      setInviteCode(res.inviteCode);
                      reset();
                    } catch (error: any) {
                      errorToast(error.message);
                    }
                  })}
                >
                  <input
                    type="text"
                    placeholder="Enter room name."
                    className="bg-[#272727] px-4 py-3 rounded-md text-white outline-none"
                    {...register("roomName", {
                      required: "Room name is required.",
                      maxLength: 50,
                      minLength: 2,
                    })}
                  />

                  {errors.roomName && (
                    <p className="text-red-400 text-sm">
                      {errors.roomName.message}
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-[#c4c4c4]">Select Mode</p>

                    <div className="relative flex bg-[#272727] rounded-md p-1">
                      <motion.div
                        layout
                        className="absolute top-1 bottom-1 w-1/2 bg-[#EFE3CA] rounded-md"
                        animate={{
                          x: selectedMode === "team" ? "100%" : "0%",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => setValue("mode", "solo")}
                        className={`w-1/2 z-10 py-2 ${
                          selectedMode === "solo" ? "text-black" : "text-white"
                        }`}
                      >
                        Solo
                      </button>

                      <button
                        type="button"
                        onClick={() => setValue("mode", "team")}
                        className={`w-1/2 z-10 py-2 ${
                          selectedMode === "team" ? "text-black" : "text-white"
                        }`}
                      >
                        Team
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedMode === "team" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <input
                          type="number"
                          placeholder="Enter number of members"
                          className="bg-[#272727] px-4 py-3 rounded-md text-white w-full"
                          {...register("maxMembers", {
                            required: "Max members required",
                            min: 2,
                            max: 10,
                          })}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="bg-[#56B6C6] py-3 rounded-md font-semibold text-black"
                  >
                    Create Room
                  </button>
                </form>

                <AnimatePresence>
                  {inviteCode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="relative rounded-lg p-[1.5px] overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0"
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
                            "linear-gradient(270deg, #170C79, #EFE3CA, #56B6C6)",
                          backgroundSize: "400% 400%",
                        }}
                      />

                      <div className="relative bg-[#222] rounded-lg p-4 flex flex-col gap-3">
                        <p className="text-sm text-[#56B6C6] font-medium">
                          Invite Code (copy now)
                        </p>

                        <div className="flex items-center justify-between bg-[#111] px-3 py-2 rounded-md">
                          <span className="text-white tracking-wider">
                            {inviteCode}
                          </span>

                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(inviteCode)
                            }
                            className="text-[#56B6C6] hover:scale-110 transition"
                          >
                            <FaCopy />
                          </button>
                        </div>

                        <p className="text-xs text-red-400">
                          ⚠ This code disappears in 10 seconds.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormCard;
