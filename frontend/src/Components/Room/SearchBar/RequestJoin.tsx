import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaUserPlus } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../services/hook";
import { request } from "../../../features/request/requestThunk";
import { errorToast } from "../../Toasters/ErroToaster";
import { successToast } from "../../Toasters/successToaster";

const RequestJoin = () => {
  const [isClicked, setIsClicked] = useState(false);
  const dispatch = useAppDispatch();

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      roomId: "",
      inviteCode: "",
    },
  });

  return (
    <>
      <motion.button
        onClick={() => setIsClicked(true)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md
        bg-[#D6FE50] text-black text-sm font-medium
        shadow-md hover:shadow-[0_0_12px_#D6FE50]"
      >
        <FaUserPlus size={12} />
        Request Join
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setIsClicked(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 40 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-[92%] max-w-md bg-[#1b1b1b] rounded-xl p-6 shadow-2xl flex flex-col gap-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg text-white font-semibold">
                    Request To Join
                  </h2>

                  <IoMdCloseCircle
                    className="size-8 text-red-500 cursor-pointer"
                    onClick={() => setIsClicked(false)}
                  />
                </div>

                <form
                  className="flex flex-col gap-3"
                  onSubmit={handleSubmit(async (data) => {
                    reset();
                    try {
                      const response = await dispatch(request(data)).unwrap();
                      successToast(response.message);
                    } catch (error: any) {
                      errorToast(error.message);
                      console.error(error);
                    }
                  })}
                >
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Enter Room ID"
                      className={`bg-[#272727] px-4 py-3 rounded-md text-white outline-none ${
                        errors.roomId ? "border border-red-500" : ""
                      }`}
                      {...register("roomId", {
                        required: "Room ID is required.",
                        minLength: {
                          value: 24,
                          message: "Room ID must be at least 24 characters",
                        },
                      })}
                    />
                    {errors.roomId && (
                      <p className="text-red-400 text-xs">
                        {errors.roomId.message}
                      </p>
                    )}
                  </div>

                  {/* Invite Code */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Enter Invite Code"
                      className={`bg-[#272727] px-4 py-3 rounded-md text-white outline-none ${
                        errors.inviteCode ? "border border-red-500" : ""
                      }`}
                      {...register("inviteCode", {
                        required: "Invite Code is required.",
                      })}
                    />
                    {errors.inviteCode && (
                      <p className="text-red-400 text-xs">
                        {errors.inviteCode.message}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-[#D6FE50] text-black font-medium py-2 rounded-md mt-2"
                  >
                    Send Request
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default RequestJoin;
