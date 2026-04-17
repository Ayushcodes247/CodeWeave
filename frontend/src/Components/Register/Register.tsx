import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";

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

  return (
    <main>
      <form
        onSubmit={handleSubmit((data) => {
          console.log("Register Data:", data);

          reset();
          setPass("");
          setIsclicked(false);
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
