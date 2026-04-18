import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { loginUser } from "../../features/authentication/authThunk";
import { useAppDispatch, useAppSelector } from "../../services/hook";

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

  const [isclicked, setIsclicked] = useState(false);
  const [pass, setPass] = useState("");

  const dispatch = useAppDispatch();
  const { authChecked } = useAppSelector((state: any) => state.authentication);
  const navigate = useNavigate();

  return (
    <main>
      {" "}
      {/* Main page div*/}
      <div>
        {" "}
        {/* Form Card */}
        <form
          onSubmit={handleSubmit(async (data) => {
            reset();
            setIsclicked(false);
            setPass("");

            try {
              const response = await dispatch(loginUser(data)).unwrap();
              if (response) {
                navigate("/dashboard");
              }
            } catch (err) {
              console.error(err);
            }
          })}
        >
          <input
            type="email"
            placeholder="Enter Email."
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
            onChange={(e) => setValue("email", e.target.value)}
          />
          {errors.email && <p>{errors.email.message}</p>}
          <input
            type="password"
            placeholder="Enter Password."
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 4,
                message: "Password must be at least 4 characters",
              },
            })}
            onChange={(e) => {
              setValue("password", e.target.value);
              setPass(e.target.value);
            }}
            onClick={() => setIsclicked(!isclicked)}
          />
          <FaEye />
          {errors.password && <p>{errors.password.message}</p>}

          <div>
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>

          <button type="submit">Login</button>
        </form>
        {isclicked && <div>{pass}</div>}
      </div>
    </main>
  );
};

export default Login;
