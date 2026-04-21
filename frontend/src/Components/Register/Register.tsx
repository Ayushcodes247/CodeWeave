import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../services/hook";
import { registerUser } from "../../features/authentication/authThunk";
import GitLogin from "../GithubButton/GitLogin";

const Register = () => {
  document.title = "Code  weave | Register";

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      gender: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authChecked } = useAppSelector((state: any) => state.authentication);

  return (
    <div className="min-h-screen w-full bg-[#0E100F] flex flex-col items-center px-4">
      <h3 className="text-[#F5F5F5] font-[sfpro] text-2xl sm:text-3xl md:text-4xl mt-10 sm:mt-12 mb-6 sm:mb-8">
        CODE WEAVE
      </h3>

      <div className="flex-1 w-full flex flex-col items-center">
        <div className="bg-[#171918] w-full max-w-sm sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg flex flex-col">
          <h4 className="text-center mb-5 sm:mb-6 text-[#ECECEC] text-lg sm:text-xl md:text-2xl font-semibold leading-6 sm:leading-8">
            Register 🤟 <br />
            Build together. Code smarter. Grow faster.
          </h4>

          <form
            className="flex flex-col"
            onSubmit={handleSubmit(async (data) => {
              reset();
              try {
                const response = await dispatch(registerUser(data)).unwrap();
                if (response) {
                  navigate("/main");
                }
              } catch (err) {
                console.error(err);
              }
            })}
          >
            {/* Username */}
            <input
              type="text"
              {...register("username", {
                required: "Username is required.",
                maxLength: 50,
                minLength: 2,
              })}
              className="bg-[#202221] mb-2 px-4 py-3 text-sm sm:text-base rounded-md shadow-xl text-[#ECECEC] outline-none"
              onChange={(e) => setValue("username", e.target.value)}
              placeholder="Enter username."
            />
            {errors.username && (
              <p className="text-red-400 text-sm mb-2">
                {errors.username.message}
              </p>
            )}

            {/* Email */}
            <input
              type="email"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter valid email",
                },
              })}
              onChange={(e) => setValue("email", e.target.value)}
              className="bg-[#202221] mb-2 px-4 py-3 text-sm sm:text-base rounded-md shadow-xl text-[#ECECEC] outline-none"
              placeholder="Enter email."
            />
            {errors.email && (
              <p className="text-red-400 text-sm mb-2">
                {errors.email.message}
              </p>
            )}

            {/* Password */}
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters",
                  },
                })}
                className="bg-[#202221] w-full px-4 py-3 text-sm sm:text-base rounded-md shadow-xl text-[#ECECEC] outline-none pr-10"
                onChange={(e) => setValue("password", e.target.value)}
                placeholder="Enter password."
              />

              {/* Eye toggle */}
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ECECEC] cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {errors.password && (
              <p className="text-red-400 text-sm mb-2">
                {errors.password.message}
              </p>
            )}

            {/* Gender */}
            <input
              type="text"
              {...register("gender", { required: "Gender is required." })}
              placeholder="Enter gender."
              className="bg-[#202221] mb-3 px-4 py-3 text-sm sm:text-base rounded-md shadow-xl text-[#ECECEC] outline-none"
            />
            {errors.gender && (
              <p className="text-red-400 text-sm mb-2">
                {errors.gender.message}
              </p>
            )}

            {/* Login Link */}
            <div className="flex justify-center gap-1 items-center mb-4 text-sm sm:text-base">
              <p className="text-[#ececec80]">Have an account?</p>
              <Link to="/login" className="text-[#D6FE50]">
                Login
              </Link>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="bg-[#D6FE50] cursor-pointer shadow-xl px-4 py-3 rounded-md font-semibold text-lg sm:text-base"
            >
              Create account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-grow border-[#ececec67]" />
            <span className="text-[#ececec67] text-sm">OR</span>
            <hr className="flex-grow border-[#ececec67]" />
          </div>

          <GitLogin />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 sm:mt-7 items-center text-sm sm:text-base">
          <p className="text-[#ececec67] underline cursor-pointer">
            Terms of use
          </p>
          <p className="text-[#ececec41]">and</p>
          <p className="text-[#ececec67] underline cursor-pointer">
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
