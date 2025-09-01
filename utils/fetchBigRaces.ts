import axios from "axios";
import FutureRace from "../models/futureRaces.schema";
export async function fetchBigRaces() {
  const rateLimitRetryDelay =
    Number(process.env.RATE_LIMIT_RETRY_DELAY_MS) || 500;
  const apiTokens = process.env.RACING_API_TOKENS?.split(",") || [];

  const tokenUsageTimestamps = new Array(apiTokens.length).fill(0);
  try {
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];

    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);
    const endDate = sixMonthsLater.toISOString().split("T")[0];

    console.log(`🔍 Fetching horse races from ${startDate} to ${endDate}.`);

    let success = false;
    let attempts = 0;
    const maxRetries = Number(process.env.MAX_RETRIES) || 5;

    while (!success && attempts < maxRetries) {
      attempts++;
      try {
        let tokenToUseIndex = 0;
        let soonestAvailable = Infinity;
        const now = Date.now();

        for (let i = 0; i < tokenUsageTimestamps.length; i++) {
          const nextAvailable = tokenUsageTimestamps[i] + rateLimitRetryDelay;
          if (nextAvailable <= now) {
            tokenToUseIndex = i;
            break;
          } else if (nextAvailable < soonestAvailable) {
            soonestAvailable = nextAvailable;
            tokenToUseIndex = i;
          }
        }

        const waitTime =
          tokenUsageTimestamps[tokenToUseIndex] + rateLimitRetryDelay - now;
        if (waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
        tokenUsageTimestamps[tokenToUseIndex] = Date.now();
        const token = apiTokens[tokenToUseIndex];
        let allResults: any[] = [];
        const config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `${process.env.RACING_API_URL}/racecards/big-races?end_date=${endDate}&start_date=${startDate}`,
          headers: {
            Authorization: `Basic ${token}`,
          },
        };
        const response = await axios.request<{ racecards: [] }>(config);
        const data = response.data;
        if (!data?.racecards?.length) {
          break;
        }
        allResults = data.racecards;
        if (allResults.length > 0) {
          for (const race of allResults) {
            const exists = await FutureRace.exists({ race_id: race.race_id });
            if (!exists) {
              console.log(`🆕 Inserting new big race: ${race.race_id}`);
              await FutureRace.create(race);
            } else {
              console.log(`✅ Big race already exists: ${race.race_id}`);
            }
          }
          console.log(`💾 Fetched ${allResults.length} racecards from API.`);
        }
        success = true;
      } catch (err: any) {
        if (err.response?.status === 429) {
          console.log(
            `⏳ Rate limit hit for fetchBigRaces, retrying in ${rateLimitRetryDelay}ms (attempt ${attempts}/${maxRetries})`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, rateLimitRetryDelay)
          );
        } else {
          console.log(
            `❌ Error on attempt ${attempts}/${maxRetries} for fetchBigRaces`
          );
        }
      }
    }

    if (!success) {
      console.log(`Max retries reached for fetchingBigRaces`);
    }
  } catch (error) {
    console.log("❌ Error in fetching big races.");
  }
}
