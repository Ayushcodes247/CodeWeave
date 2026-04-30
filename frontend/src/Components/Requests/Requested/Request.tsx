import React, { useState, useEffect } from "react";
import { errorToast } from "../../Toasters/ErroToaster";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch } from "../../../services/hook";
import { requesterRequest } from "../../../features/request/requestThunk";

type RequestType = {
  _id: string;
  roomId: string;
  uid: string;
  status: string;
  roomName: string;
};

const Requester = () => {
  const [resData, setResData] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchRequesterRequest = async () => {
      try {
        setLoading(true);

        const response = await dispatch(
          requesterRequest({ page: 1, limit: 6 }),
        ).unwrap();

        if (isMounted) {
          setResData(response.requests || []);
        }
      } catch (error: any) {
        errorToast(error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRequesterRequest();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="text-lg text-[#F1F1F1] capitalize font-medium">
        your requests status
      </h2>

      {loading && (
        <div className="text-[#888] text-sm">Loading requests...</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {!loading && resData.length > 0
            ? resData.map((req, index) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.04, y: -6 }}
                  transition={{
                    delay: index * 0.06,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="relative cursor-pointer min-h-[150px] sm:h-[135px] rounded-lg p-[1.5px] overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    whileHover={{ filter: "brightness(1.3)" }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      background:
                        "linear-gradient(270deg, #ff0055, #ff7a00, #ffd500, #00ffcc, #0066ff, #b300ff)",
                      backgroundSize: "400% 400%",
                    }}
                  />

                  <div className="relative bg-[#020202] rounded-lg p-4 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-white text-lg sm:text-2xl uppercase font-medium break-words">
                        {req.roomName}
                      </p>

                      <span
                        className={`text-xs sm:text-sm px-2 py-1 rounded capitalize shrink-0 ${
                          req.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : req.status === "fulfilled"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-sm text-[#aaa] break-all">
                        Room ID : {req.roomId}
                      </p>

                      <p className="text-xs text-[#888] break-all">
                        Request ID : {req._id}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            : !loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#777] text-sm text-center col-span-2"
                >
                  No requests found
                </motion.p>
              )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Requester;
