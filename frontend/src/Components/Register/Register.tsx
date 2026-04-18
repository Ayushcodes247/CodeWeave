import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../services/hook";
import { registerUser } from "../../features/authentication/authThunk";

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

  const [isclicked, setIsclicked] = useState(false);
  const [pass, setPass] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authChecked } = useAppSelector((state: any) => state.authentication);

  return (
    <main>
      <form
        onSubmit={handleSubmit(async (data) => {
          reset();
          setPass("");
          setIsclicked(false);

          const response = await dispatch(registerUser(data)).unwrap();
          console.log("Register response:", response);
          try {
            const response = await dispatch(registerUser(data)).unwrap();
            if (response) {
              navigate("/dashboard");
            }
          } catch (err) {
            console.error(err);
          }
        })}
      >
        <input
          type="text"
          {...register("username", {
            required: "Username is required.",
            maxLength: 50,
            minLength: 2,
          })}
          onChange={(e) => setValue("username", e.target.value)}
          placeholder="Enter username."
        />
        {errors.username && (
          <p className="text-red-400">{errors.username.message}</p>
        )}

        <input
          type="email"
          {...register("email", {
            required: "Email is required.",
            pattern: /^\S+@\S+\.\S+$/,
          })}
          onChange={(e) => setValue("email", e.target.value)}
          placeholder="Enter email."
        />
        {errors.email && <p className="text-red-400">{errors.email.message}</p>}
        <input
          type="password"
          {...register("password", {
            required: "Password is required.",
            minLength: 6,
          })}
          onChange={(e) => {
            setValue("password", e.target.value);
            setPass(e.target.value);
          }}
          placeholder="Enter password."
          onClick={() => {
            setIsclicked(!isclicked);
          }}
        />
        <FaEye />
        {errors.password && (
          <p className="text-red-400">{errors.password.message}</p>
        )}
        <input
          type="text"
          {...register("gender", { required: "Gender is required." })}
          placeholder="Enter gender."
        />
        {errors.gender && (
          <p className="text-red-400">{errors.gender.message}</p>
        )}
        <div>
          <p>Have an account?</p>
          <Link to="/login">Login</Link>
        </div>

        <button type="submit">Create account</button>
      </form>

      {isclicked && <div>{pass}</div>}
    </main>
  );
};

export default Register;
