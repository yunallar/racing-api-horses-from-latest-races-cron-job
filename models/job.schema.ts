import mongoose from "mongoose";

export type JobType =
  | "FETCH_HORSE_RACE_RESULTS"
  | "FETCH_HORSE_PROFILES"
  | "CREATE_OWNERS_HORSES_MAPPING";

const allowedJobTypes: JobType[] = [
  "FETCH_HORSE_RACE_RESULTS",
  "FETCH_HORSE_PROFILES",
  "CREATE_OWNERS_HORSES_MAPPING",
];

const jobSchema = new mongoose.Schema({
  type: { type: String, enum: allowedJobTypes, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

jobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }); // optional TTL for auto cleanup (7 days)

export const Job = mongoose.model("Job", jobSchema);
