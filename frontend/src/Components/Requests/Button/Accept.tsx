import React from "react";
import { TiTick } from "react-icons/ti";
import { motion } from "motion/react";
import { useAppDispatch } from "../../../services/hook";
import { acceptRequest } from "../../../features/request/requestThunk";
import { successToast } from "../../Toasters/successToaster";
import { errorToast } from "../../Toasters/ErroToaster";

type Prop = {
  roomId: string;
  uid: string;
  onSuccess: (status: string) => void;
};

const Accept = ({ roomId, uid, onSuccess }: Prop) => {
  const dispatch = useAppDispatch();

  const clickHandler = async () => {
    try {
      const response = await dispatch(acceptRequest({ roomId, uid })).unwrap();

      successToast(response.message);

      const status = response.reqsReturn?.status;

      if (status) {
        onSuccess(status);
      }
    } catch (error: any) {
      errorToast(error.message);
    }
  };

  return (
    <motion.button
      onClick={clickHandler}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="w-7 h-7 flex items-center justify-center
      bg-[#83fb54] rounded-xs shadow-md cursor-pointer"
    >
      <TiTick size={20} />
    </motion.button>
  );
};

export default Accept;
