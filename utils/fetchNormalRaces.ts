import axios from "axios";
import FutureRace from "../models/futureRaces.schema"; // adjust path if necessary
export async function fetchNormalRaces() {
  const rateLimitRetryDelay =
    Number(process.env.RATE_LIMIT_RETRY_DELAY_MS) || 500;
  const apiTokens = process.env.RACING_API_TOKENS?.split(",") || [];

  const tokenUsageTimestamps = new Array(apiTokens.length).fill(0);
  try {
    const today = new Date();
    const dates: string[] = [];
    const daysInMonth = 30;

    for (let i = 0; i < daysInMonth; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const yyyyMmDd = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
      dates.push(yyyyMmDd);
    }

    console.log(
      `🔍 Fetching horse races for the next ${daysInMonth} days starting ${dates[0]}.`
    );

    for (const date of dates) {
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
            url: `${process.env.RACING_API_URL}/racecards/pro?date=${date}`,
            headers: {
              Authorization: `Basic ${token}`,
            },
          };
          const response = await axios.request<{ racecards: [] }>(config);
          const data = response.data;
          if (!data?.racecards?.length) {
            console.log(`📭 [${date}] No racecards found, skipping.`);
            success = true;
            break;
          }
          allResults = data.racecards;
          if (allResults.length > 0) {
            for (const race of allResults) {
              const exists = await FutureRace.exists({ race_id: race.race_id });
              if (!exists) {
                console.log(`🆕 [${date}] Inserting new race: ${race.race_id}`);
                await FutureRace.create(race);
              } else {
                console.log(
                  `✅ [${date}] Race already exists: ${race.race_id}`
                );
              }
            }
            console.log(
              `💾 [${date}] Fetched ${allResults.length} racecards from API.`
            );
          }
          success = true;
        } catch (err: any) {
          if (err.response?.status === 429) {
            console.log(
              `⏳ [${date}] Rate limit hit, retrying in ${rateLimitRetryDelay}ms (attempt ${attempts}/${maxRetries})`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, rateLimitRetryDelay)
            );
          } else {
            console.log(
              `❌ [${date}] Error on attempt ${attempts}/${maxRetries}`
            );
          }
        }
      }

      if (!success) {
        console.log(`⚠️ [${date}] Max retries reached`);
      }
    }
  } catch (error) {
    console.log("❌ Error in fetching normal races.");
  }
}
