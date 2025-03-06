import mongoose from "mongoose";

// Explicitly specify the database name in the connection string
const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "nft-portfolio";

// Ensure the connection string includes the database name
const getConnectionString = () => {
  // If URI already has a database name, use it as is
  if (MONGODB_URI.includes("/nft-portfolio")) {
    return MONGODB_URI;
  }

  // Otherwise, append the database name
  const baseUri = MONGODB_URI.endsWith("/")
    ? MONGODB_URI.slice(0, -1)
    : MONGODB_URI;
  return `${baseUri}/${DB_NAME}`;
};

// Define the cached mongoose connection type
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare global mongoose cache
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const connectionString = getConnectionString();
    cached.promise = mongoose.connect(connectionString);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
