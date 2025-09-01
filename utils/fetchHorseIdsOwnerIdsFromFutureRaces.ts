import type { IFutureRace } from "../models/futureRaces.schema";

type FutureRaceLike = Pick<IFutureRace, "runners">;

/**
 * Extract unique horseId-ownerId pairs from an array of future races.
 * @param futureRaces Array of future race documents or plain objects
 * @returns Array of unique { horseId, ownerId, horse, owner } pairs
 */
export function fetchHorseIdsOwnerIdsFromFutureRaces(
  futureRaces: FutureRaceLike[]
): { horseId: string; ownerId: string; horse: string; owner: string }[] {
  const uniquePairs = new Map<
    string,
    { horseId: string; ownerId: string; horse: string; owner: string }
  >();

  for (const race of futureRaces) {
    if (!race.runners) continue;

    for (const runner of race.runners) {
      const horseId = runner.horse_id!;
      const ownerId = runner.owner_id!;
      const horse = runner.horse!;
      const owner = runner.owner!;
      if (!horseId || !ownerId) continue;

      if (!uniquePairs.has(horseId)) {
        uniquePairs.set(horseId, { horseId, ownerId, horse, owner });
      }
    }
  }

  return Array.from(uniquePairs.values());
}
