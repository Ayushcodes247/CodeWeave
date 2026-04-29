import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../../services/hook";
import { ownerRequests } from "../../../features/request/requestThunk";
import { motion, AnimatePresence } from "motion/react";
import Accept from "../Button/Accept";
import Reject from "../Button/Reject";

type RequestResponse = {
  _id: string;
  roomId: string;
  requesterId: string;
  status: string;
  roomName: string;
};

const Owner = () => {
  const [requests, setRequests] = useState<RequestResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      try {
        setLoading(true);

        const response = await dispatch(
          ownerRequests({ page: 1, limit: 6 }),
        ).unwrap();

        if (isMounted) {
          setRequests(response.requests || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const updateStatus = (roomId: string, uid: string, status: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.roomId === roomId && req.requesterId === uid
          ? { ...req, status }
          : req,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="text-lg text-[#F1F1F1] capitalize font-medium">
        Requests for room access
      </h2>

      {loading && (
        <div className="text-[#888] text-sm">Loading requests...</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {!loading && requests.length > 0
            ? requests.map((req, index) => (
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
                  className="relative min-h-[150px] sm:h-[135px] rounded-lg p-[1.5px] overflow-hidden"
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
                        Requester ID : {req.requesterId}
                      </p>

                      <p className="text-sm text-[#777] break-all">
                        Room ID : {req.roomId}
                      </p>
                    </div>

                    {req.status === "pending" && (
                      <div className="flex justify-end gap-3 mt-3 sm:absolute sm:bottom-3 sm:right-3">
                        <Accept
                          roomId={req.roomId}
                          uid={req.requesterId}
                          onSuccess={(status) =>
                            updateStatus(req.roomId, req.requesterId, status)
                          }
                        />
                        <Reject
                          roomId={req.roomId}
                          uid={req.requesterId}
                          onSuccess={(status) =>
                            updateStatus(req.roomId, req.requesterId, status)
                          }
                        />
                      </div>
                    )}
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

export default Owner;
