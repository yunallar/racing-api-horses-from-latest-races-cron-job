import mongoose from "mongoose";

export async function connectToMongo() {
  const uri = process.env.MONGODB_URI!;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
}

export async function disconnectFromMongo() {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}
