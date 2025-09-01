import { Job, JobType } from "../models/job.schema";

export type HorseOwnerPair = { horseId: string; ownerId: string };

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Create jobs to fetch race results, horse profiles, and owners-horses mapping for each {horseId, ownerId} pair.
 * Jobs are inserted in batches for performance.
 *
 * @param pairs Unique list of { horseId, ownerId } pairs
 * @param options.batchSize Number of pairs per batch (defaults to 50)
 * @returns Summary of created jobs
 */
export async function createJobs(
  pairs: HorseOwnerPair[],
  options?: { batchSize?: number }
): Promise<{
  totalPairs: number;
  createdRaceResultJobs: number;
  createdProfileJobs: number;
  createdMappingJobs: number;
}> {
  const batchSize = options?.batchSize ?? 50;
  const batches = chunk(pairs, batchSize);

  let createdRaceResultJobs = 0;
  let createdProfileJobs = 0;
  let createdMappingJobs = 0;

  for (const batch of batches) {
    // Build docs for each job type
    const raceResultDocs = batch.map((p) => ({
      type: "FETCH_HORSE_RACE_RESULTS" as JobType,
      payload: { horseId: p.horseId, ownerId: p.ownerId },
    }));

    const profileDocs = batch.map((p) => ({
      type: "FETCH_HORSE_PROFILES" as JobType,
      payload: { horseId: p.horseId, ownerId: p.ownerId },
    }));

    const mappingDocs = batch.map((p) => ({
      type: "CREATE_OWNERS_HORSES_MAPPING" as JobType,
      payload: { horseId: p.horseId, ownerId: p.ownerId },
    }));

    // Insert in separate bulk ops to keep types isolated
    const insertedRace = await Job.insertMany(raceResultDocs, {
      ordered: false,
    });
    createdRaceResultJobs += insertedRace.length;

    const insertedProfiles = await Job.insertMany(profileDocs, {
      ordered: false,
    });
    createdProfileJobs += insertedProfiles.length;

    const insertedMappings = await Job.insertMany(mappingDocs, {
      ordered: false,
    });
    createdMappingJobs += insertedMappings.length;
  }

  return {
    totalPairs: pairs.length,
    createdRaceResultJobs,
    createdProfileJobs,
    createdMappingJobs,
  };
}
