import React from "react";
import { IoClose } from "react-icons/io5";
import { motion } from "motion/react";
import { errorToast } from "../../Toasters/ErroToaster";
import { successToast } from "../../Toasters/successToaster";
import { useAppDispatch } from "../../../services/hook";
import { rejectRequest } from "../../../features/request/requestThunk";

type Prop = {
  roomId: string;
  uid: string;
  onSuccess: (status: string) => void;
};

const Reject = ({ roomId, uid, onSuccess }: Prop) => {
  const dispatch = useAppDispatch();

  const clickHandler = async () => {
    try {
      const response = await dispatch(rejectRequest({ roomId, uid })).unwrap();

      successToast(response.message);

      const status = response.reqsReturn?.status;

      if (status) {
        onSuccess(status);
      }
    } catch (error: any) {
      errorToast(error.message);
      console.error("Error in reject request click function:", error);
    }
  };

  return (
    <motion.button
      onClick={clickHandler}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="w-7 h-7 flex items-center justify-center
      bg-[#ff1c1c] rounded-xs shadow-md cursor-pointer"
    >
      <IoClose size={20} />
    </motion.button>
  );
};

export default Reject;
