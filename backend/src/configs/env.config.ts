import dotenv from "dotenv";
dotenv.config();

export interface EnvConfiguration {
  PORT: number | string;
  MONGOURI: string;
  NODE_ENV: string;
  ORIGIN : string; 
  SECRET : string;
  BASE_URL : string;
  TEST_DB : string;
}

export const env: EnvConfiguration = {
  PORT: process.env.PORT || 3000,
  MONGOURI: process.env.MONGO_URI || "mongodb://localhost:27107/your-db",
  NODE_ENV: process.env.NODE_ENV || "development",
  ORIGIN : process.env.ORIGIN || "*",
  SECRET : process.env.JWT_SECRET || "your secret key",
  BASE_URL : process.env.BASE_URL || "your base url.",
  TEST_DB : process.env.TEST_DB_URI || "test_db",
};

if(!env){
    throw new Error("Environment variables are not properly configured.");
}