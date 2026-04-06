import dotenv from "dotenv";
dotenv.config();

export interface EnvConfiguration {
  PORT: number | string;
  MONGOURI: string;
  NODE_ENV: string;
  ORIGIN : string; 
}

export const env: EnvConfiguration = {
  PORT: process.env.PORT || 3000,
  MONGOURI: process.env.MONGO_URI || "mongodb://localhost:27107/your-db",
  NODE_ENV: process.env.NODE_ENV || "development",
  ORIGIN : process.env.ORIGIN || "*"
};

if(!env){
    throw new Error("Environment variables are not properly configured.");
}