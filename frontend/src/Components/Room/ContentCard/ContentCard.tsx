import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch } from "../../../services/hook";
import { errorToast } from "../../Toasters/ErroToaster";
import { successToast } from "../../Toasters/successToaster";
import { getRoomData } from "../../../features/rooms/roomThunk";
import { Link } from "react-router-dom";
import { FaDoorOpen } from "react-icons/fa";

type roomDetails = {
  _id: string;
  roomName: string;
  ownerName: string;
  membersCount: number;
  maxMembers: number;
  role: "owner" | "viewer" | "editor";
};

const ContentCard = () => {
  const [roomDet, setRoomDet] = useState<roomDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchRoomDetails = async () => {
      try {
        setIsLoading(true);

        const response = await dispatch(
          getRoomData({ page: 1, limit: 10 }),
        ).unwrap();

        if (isMounted) {
          setRoomDet(response.room || []);
        }

        if (response.success) {
          successToast(response.message);
        }
      } catch (error: any) {
        errorToast(error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRoomDetails();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return (
    <>
      <AnimatePresence>
        {!isLoading &&
          roomDet.map((room, index) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.04, y: -6 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="relative w-full h-[190px] rounded-xl p-[1.5px] overflow-hidden"
            >
              {/* Animated Border */}
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
                    "linear-gradient(270deg, #FFE97D, #FFEF9F, #FF537B, #FFE97D)",
                  backgroundSize: "400% 400%",
                }}
              />

              {/* Card */}
              <div className="relative bg-[#1E1E1E] rounded-xl h-full p-5 flex flex-col justify-between">
                {/* TOP */}
                <div className="flex flex-col gap-3">
                  <p className="text-white text-lg font-semibold uppercase truncate">
                    {room.roomName}
                  </p>

                  <p className="text-sm text-[#aaa]">
                    Owner: <span className="text-white">{room.ownerName}</span>
                  </p>

                  <p className="text-sm text-[#aaa]">
                    Members:{" "}
                    <span className="text-white">
                      {room.membersCount}/{room.maxMembers}
                    </span>
                  </p>
                </div>

                {/* BOTTOM */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded capitalize ${
                      room.role === "owner"
                        ? "bg-green-500/20 text-green-400"
                        : room.role === "editor"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {room.role}
                  </span>

                  {/* GATE BUTTON */}
                  <Link to={`/room/${room.roomName}/${room._id}`}>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#111] text-white border border-[#333] hover:border-[#FFE97D] transition"
                    >
                      <FaDoorOpen />
                      Enter
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

        {/* EMPTY */}
        {!isLoading && roomDet.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#777] col-span-full text-center"
          >
            No rooms found
          </motion.p>
        )}

        {/* SKELETON */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[190px] rounded-xl bg-[#1E1E1E] p-5 animate-pulse"
            >
              <div className="flex flex-col gap-3">
                <div className="h-5 w-32 bg-[#333] rounded" />
                <div className="h-4 w-40 bg-[#333] rounded" />
                <div className="h-4 w-28 bg-[#333] rounded" />
                <div className="h-6 w-20 bg-[#333] rounded" />
              </div>
            </div>
          ))}
      </AnimatePresence>
    </>
  );
};

export default ContentCard;
