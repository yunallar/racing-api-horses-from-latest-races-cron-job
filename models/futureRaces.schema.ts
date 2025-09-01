import mongoose from "mongoose";

export interface IFutureRaceRunner {
  horse_id?: string;
  horse?: string;
  dob?: string;
  age?: string;
  sex?: string;
  sex_code?: string;
  colour?: string;
  region?: string;
  breeder?: string;
  dam?: string;
  dam_id?: string;
  dam_region?: string;
  sire?: string;
  sire_id?: string;
  sire_region?: string;
  damsire?: string;
  damsire_id?: string;
  damsire_region?: string;
  trainer?: string;
  trainer_id?: string;
  trainer_location?: string;
  trainer_14_days?: Record<string, any>;
  owner?: string;
  owner_id?: string;
  prev_trainers?: any[];
  prev_owners?: any[];
  comment?: string;
  spotlight?: string;
  quotes?: any[];
  stable_tour?: any[];
  medical?: any[];
  number?: string;
  draw?: string;
  headgear?: string;
  headgear_run?: string;
  wind_surgery?: string;
  wind_surgery_run?: string;
  past_results_flags?: any[];
  lbs?: string;
  ofr?: string;
  rpr?: string;
  ts?: string;
  jockey?: string;
  jockey_id?: string;
  silk_url?: string;
  last_run?: string;
  form?: string;
  trainer_rtf?: string;
  odds?: any[];
}

export interface IFutureRace {
  _id?: any;
  race_id: string;
  course?: string;
  course_id?: string;
  date: string; // e.g., "2025-05-12"
  off_time?: string;
  off_dt?: Date;
  race_name?: string;
  distance_round?: string;
  distance?: string;
  distance_f?: number;
  region?: string;
  pattern?: string;
  sex_restriction?: string;
  race_class?: string;
  type?: string;
  age_band?: string;
  rating_band?: string;
  prize?: string;
  field_size?: string;
  going_detailed?: string;
  rail_movements?: string;
  stalls?: string;
  weather?: string;
  going?: string;
  surface?: string;
  jumps?: string;
  big_race?: boolean;
  is_abandoned?: boolean;
  tip?: string;
  verdict?: string;
  betting_forecast?: string;
  runners?: IFutureRaceRunner[];
  createdAt?: Date;
  updatedAt?: Date;
}

const futureRaceSchema = new mongoose.Schema(
  {
    race_id: { type: String, required: true, unique: true, index: true },
    course: String,
    course_id: String,
    date: { type: String, required: true }, // e.g., "2025-05-12"
    off_time: String,
    off_dt: Date,
    race_name: String,
    distance_round: String,
    distance: String,
    distance_f: Number,
    region: String,
    pattern: String,
    sex_restriction: String,
    race_class: String,
    type: String,
    age_band: String,
    rating_band: String,
    prize: String,
    field_size: String,
    going_detailed: String,
    rail_movements: String,
    stalls: String,
    weather: String,
    going: String,
    surface: String,
    jumps: String,
    big_race: { type: Boolean, default: false },
    is_abandoned: { type: Boolean, default: false },
    tip: String,
    verdict: String,
    betting_forecast: String,
    runners: [
      {
        horse_id: String,
        horse: String,
        dob: String,
        age: String,
        sex: String,
        sex_code: String,
        colour: String,
        region: String,
        breeder: String,
        dam: String,
        dam_id: String,
        dam_region: String,
        sire: String,
        sire_id: String,
        sire_region: String,
        damsire: String,
        damsire_id: String,
        damsire_region: String,
        trainer: String,
        trainer_id: String,
        trainer_location: String,
        trainer_14_days: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        owner: String,
        owner_id: String,
        prev_trainers: {
          type: [mongoose.Schema.Types.Mixed],
          default: [],
        },
        prev_owners: {
          type: [mongoose.Schema.Types.Mixed],
          default: [],
        },
        comment: String,
        spotlight: String,
        quotes: {
          type: [mongoose.Schema.Types.Mixed],
          default: [],
        },
        stable_tour: {
          type: [mongoose.Schema.Types.Mixed],
          default: [],
        },
        medical: {
          type: [mongoose.Schema.Types.Mixed],
          default: [],
        },
        number: String,
        draw: String,
        headgear: String,
        headgear_run: String,
        wind_surgery: String,
        wind_surgery_run: String,
        past_results_flags: {
          type: [mongoose.Schema.Types.Mixed],
          default: [],
        },
        lbs: String,
        ofr: String,
        rpr: String,
        ts: String,
        jockey: String,
        jockey_id: String,
        silk_url: String,
        last_run: String,
        form: String,
        trainer_rtf: String,
        odds: {
          type: [mongoose.Schema.Types.Mixed],
          default: [],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("future_race", futureRaceSchema);
