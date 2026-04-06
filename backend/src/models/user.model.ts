import { Model , Schema , Document } from "mongoose";
import Joi , { ValidationResult } from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@configs/env.config";

export interface IUser extends Document {
    username : string;
    email : string;
    password : string;
    
};