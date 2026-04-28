import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const NavBar = () => {
  const links = [
    { name: "Home", path: "/main" },
    { name: "Rooms", path: "/room" },
    { name: "Request", path: "/request"},
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div className="w-full px-4 mt-4">
      <div className="w-full max-w-6xl mx-auto rounded-md bg-[#1E1E1E] shadow-lg">
        <nav className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 py-4 gap-4 sm:gap-0">
          <h1 className="font-[vostra] text-2xl sm:text-3xl text-[#F5F5F5] font-extralight">
            CodeWeave
          </h1>

          <ul className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 relative">
            {links.map((link) => {
              const isActive = useLocation().pathname === link.path;

              return (
                <li key={link.path} className="relative">
                  <Link to={link.path}>
                    <motion.div
                      whileTap={{ scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      className="relative px-4 py-2 rounded-md text-sm font-semibold sm:text-base capitalize cursor-pointer"
                    >
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-[#D4FB54] rounded"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                      </AnimatePresence>

                      <span
                        className={`relative z-10 transition-colors duration-300 ${
                          isActive
                            ? "text-[#202221]"
                            : "text-[#F5F5F5] hover:text-white"
                        }`}
                      >
                        {link.name}
                      </span>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default NavBar;
