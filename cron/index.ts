import { connectToMongo, disconnectFromMongo } from "../utils/mongo";
import { getAllFutureRaces } from "../utils/getAllFutureRaces";
import { fetchHorseIdsOwnerIdsFromFutureRaces } from "../utils/fetchHorseIdsOwnerIdsFromFutureRaces";
import { createJobs } from "../utils/createJobs";
import dotenv from "dotenv";
dotenv.config();

async function syncData() {
  await connectToMongo();
  console.log("✅ Connected to MongoDB");
  const futureRaces = await getAllFutureRaces();
  console.log(`✅ Retrieved ${futureRaces.length} future races`);
  const uniqueHorsesOwners = await fetchHorseIdsOwnerIdsFromFutureRaces(
    futureRaces
  );
  console.log(
    `✅ Extracted ${uniqueHorsesOwners.length} unique horse-owner pairs`
  );
  const jobsSummary = await createJobs(uniqueHorsesOwners);
  console.log("✅ Jobs created summary:", jobsSummary);
  console.log(`✅ Cron job completed`);
  await disconnectFromMongo();
  console.log("✅ Disconnected from MongoDB");
  process.exit(0);
}

(async () => {
  try {
    await syncData();
  } catch (err) {
    console.log("❌ Cron job failed:", err);
    await disconnectFromMongo();
    process.exit(1);
  }
})();
