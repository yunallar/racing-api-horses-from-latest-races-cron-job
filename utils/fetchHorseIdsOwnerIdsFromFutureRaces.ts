import { DocumentType } from "@typegoose/typegoose";
import { LeanDocument } from "mongoose";
import { IFutureRace } from "../models/futureRaces.schema";

/**
 * Extract unique horseId-ownerId pairs from an array of future races.
 * @param futureRaces Array of future race documents or plain objects
 * @returns Array of unique { horseId, ownerId } pairs
 */
export function fetchHorseIdsOwnerIdsFromFutureRaces(
  futureRaces: Array<LeanDocument<DocumentType<IFutureRace>>> | any[]
): { horseId: string; ownerId: string }[] {
  const uniquePairs = new Map<string, { horseId: string; ownerId: string }>();

  for (const race of futureRaces) {
    if (!race.runners) continue;

    for (const runner of race.runners) {
      const horseId = runner?.horse_id;
      const ownerId = runner?.owner_id;
      if (!horseId || !ownerId) continue;

      if (!uniquePairs.has(horseId)) {
        uniquePairs.set(horseId, { horseId, ownerId });
      }
    }
  }

  return Array.from(uniquePairs.values());
}
