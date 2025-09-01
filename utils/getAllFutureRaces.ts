import FutureRace from "../models/futureRaces.schema";

/**
 * Fetch all future races from the DB and return as a plain array
 */
export async function getAllFutureRaces(): Promise<any[]> {
  try {
    const races = await FutureRace.find({}, null, { lean: true }).exec();
    return Array.isArray(races) ? races : [];
  } catch (err) {
    console.log("❌ Error fetching future races from DB.", err);
    return [];
  }
}
