import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaPlusCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { useForm } from "react-hook-form";

const FormCard = () => {
  const [clicked, setClicked] = useState(false);
  const {
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur", defaultValues: {} });

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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-[92%] max-w-lg min-h-80 bg-[#1b1b1b] rounded-xl p-6 shadow-xl flex flex-col"
            >
              <h2 className="text-xl text-white mb-4 flex justify-between">
                Create Room
                <IoMdCloseCircle
                  className="size-9 text-red-500 cursor-pointer"
                  onClick={() => setClicked(false)}
                />
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormCard;
