import { connectToMongo, disconnectFromMongo } from "../utils/mongo";
import { fetchBigRaces } from "../utils/fetchBigRaces";
import { fetchNormalRaces } from "../utils/fetchNormalRaces";
import dotenv from "dotenv";
dotenv.config();

async function syncData() {
  await connectToMongo();
  await fetchNormalRaces();
  await fetchBigRaces();
  console.log(`✅ Cron job completed`);
  await disconnectFromMongo();
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
