import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaPlusCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../services/hook";
import { create } from "../../../features/rooms/roomThunk";

type FormValues = {
  roomName: string;
  mode: "solo" | "team";
  maxMembers: number;
};

const FormCard = () => {
  const [clicked, setClicked] = useState(false);

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

  useEffect(() => {
    if (selectedMode === "solo") {
      setValue("maxMembers", 1);
    }
  }, [selectedMode, setValue]);
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state : any) => state.room);

  return (
    <div className="flex-none">
      <motion.div
        onClick={() => setClicked(true)}
        layout
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-[20rem] h-56 rounded-xl bg-[#1E1E1E] shadow-xl p-4 flex items-center justify-center"
      >
        <FaPlusCircle className="size-12 text-[#c4c4c4]" />
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
              className="w-[92%] max-w-lg min-h-80 bg-[#1b1b1b] rounded-xl p-6 shadow-xl flex flex-col"
            >
              <h2 className="text-xl text-white mb-4 flex justify-between items-center">
                Create Room
                <IoMdCloseCircle
                  className="size-9 text-red-500 cursor-pointer"
                  onClick={() => setClicked(false)}
                />
              </h2>

              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(async (data) => {
                  reset();

                  console.log("Room creation data from form:", {
                    ...data,
                    maxMembers: Number(data.maxMembers),
                  });
                  try {
                    const senitizedData = { ...data , maxMembers : Number(data.maxMembers) };
                    const response = await dispatch(create(senitizedData)).unwrap();
                    console.log("room creation form response:", response);
                  } catch (error) {
                    console.error(error);
                  }
                })}
              >
                <input
                  type="text"
                  placeholder="Enter room name."
                  className="bg-[#272727] px-4 py-3 rounded-md text-white outline-none"
                  {...register("roomName", {
                    required: "room name is required.",
                    maxLength: 50,
                    minLength: 2,
                  })}
                  onChange={(e) => setValue("roomName", e.target.value)}
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
                      className="absolute top-1 bottom-1 w-1/2 bg-[#D6FE50] rounded-md"
                      animate={{
                        x: selectedMode === "team" ? "100%" : "0%",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setValue("mode", "solo")}
                      className={`w-1/2 z-10 py-2 text-sm font-medium ${
                        selectedMode === "solo" ? "text-black" : "text-white"
                      }`}
                    >
                      Solo
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue("mode", "team")}
                      className={`w-1/2 z-10 py-2 text-sm font-medium ${
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
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="number"
                        placeholder="Enter number of members"
                        className="bg-[#272727] px-4 py-3 rounded-md text-white outline-none w-full"
                        {...register("maxMembers", {
                          valueAsNumber: true,
                          required: "Max members required",
                          min: {
                            value: 2,
                            message: "Minimum 2 members",
                          },
                          max: {
                            value: 10,
                            message: "Max 10 members allowed",
                          },
                        })}
                      />

                      {errors.maxMembers && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.maxMembers.message}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="bg-[#D6FE50] cursor-pointer shadow-xl px-4 py-3 rounded-md font-semibold text-lg sm:text-base"
                >
                  Create Room
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormCard;
