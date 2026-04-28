import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser } from "../../features/authentication/authThunk";
import { useAppDispatch, useAppSelector } from "../../services/hook";
import GitLogin from "../GithubButton/GitLogin";
import { ShowAuthToaster } from "../Toasters/AuthToaster";
import { errorToast } from "../Toasters/ErroToaster";

const Login = () => {
  document.title = "Code weave | Login";

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0E100F] flex flex-col items-center px-4">
      <h3 className="text-[#F5F5F5] font-[sfpro] text-2xl sm:text-3xl md:text-4xl mt-10 sm:mt-12 mb-6 sm:mb-8">
        CODE WEAVE
      </h3>

      <div className="flex-1 w-full flex flex-col items-center">
        <div className="bg-[#171918] w-full max-w-sm sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg flex flex-col">
          <h4 className="text-center mb-5 sm:mb-6 text-[#ECECEC] font-[ttregular] text-lg sm:text-xl md:text-2xl font-semibold leading-6 sm:leading-8">
            Hey✌️ <br />
            Start coding together, right now.
          </h4>

          <form
            className="flex flex-col"
            onSubmit={handleSubmit(async (data) => {
              reset();
              try {
                const response = await dispatch(loginUser(data)).unwrap();
                ShowAuthToaster(
                  {
                    _id: response.user._id,
                    username: response.user.username,
                    profilePic: response.user.profilePic,
                  },
                  response.message,
                );
                if (response) {
                  navigate("/main");
                }
              } catch (err : any) {
                errorToast(err.message);
                console.error(err);
              }
            })}
          >
            {/* Email */}
            <input
              type="email"
              placeholder="Enter Email."
              className="bg-[#202221] mb-2 px-4 py-3 text-sm sm:text-base rounded-md shadow-xl text-[#ECECEC] outline-none"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
              onChange={(e) => setValue("email", e.target.value)}
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
                placeholder="Enter Password."
                className="bg-[#202221] w-full px-4 py-3 text-sm sm:text-base rounded-md shadow-xl text-[#ECECEC] outline-none pr-10"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 4,
                    message: "Password must be at least 4 characters",
                  },
                })}
                onChange={(e) => setValue("password", e.target.value)}
              />

              {/* Eye Icon */}
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ECECEC] cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {errors.password && (
              <p className="text-red-400 text-sm mb-3">
                {errors.password.message}
              </p>
            )}

            {/* Register */}
            <div className="flex justify-center gap-1 items-center mb-4 text-sm sm:text-base">
              <p className="text-[#ececec80]">Don't have an account?</p>
              <Link to="/register" className="text-[#D6FE50]">
                Register
              </Link>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="bg-[#D6FE50] cursor-pointer shadow-xl px-4 py-3 rounded-md font-semibold text-sm sm:text-base"
            >
              Login Account
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

export default Login;
