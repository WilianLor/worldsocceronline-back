const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamTendersSchema = new mongoose.Schema({
  tendersId: {
    type: Schema.Types.ObjectId,
    ref: "Tenders",
  },
  method: {
    type: String,
  },
});

const InterestCoaches = new mongoose.Schema({
  coachId: {
    type: Schema.Types.ObjectId,
    ref: "Coach",
  },
});

const MovementsSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  value: {
    type: Number,
  },
  type: {
    type: Boolean,
  },
  date: {
    type: Date,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: "Team",
  },
  coachId: {
    type: Schema.Types.ObjectId,
    ref: "Coach",
  },
});

const PlayerSchema = new mongoose.Schema({
  playerId: {
    type: Schema.Types.ObjectId,
    ref: "Player",
  },
});

const LineupSchema = new mongoose.Schema({
  formation: {
    type: Number,
    required: true,
  },
  titularPlayers: [PlayerSchema],
  reservePlayers: [PlayerSchema],
});

const ExpertsSchema = new mongoose.Schema({
  penalty: PlayerSchema,
  foul: PlayerSchema,
  captain: PlayerSchema,
  cornerRight: PlayerSchema,
  cornerLeft: PlayerSchema,
});

const LineTaticsScheme = new mongoose.Schema({
  forwards: {
    type: Number,
  },
  midfielders: {
    type: Number,
  },
  defencers: {
    type: Number,
  },
});

const TaticsSchema = new mongoose.Schema({
  experts: ExpertsSchema,
  lineTatics: LineTaticsScheme,
  pressure: {
    type: Number,
  },
  typeOfPlay: {
    type: Number,
  },
  styleOfPlay: {
    type: Number,
  },
  marking: {
    type: Number,
  },
});

const FundsSchema = new mongoose.Schema({
  total: {
    type: Number,
    required: true,
  },
  payroll: {
    type: Number,
    required: true,
  },
  movements: [MovementsSchema],
});

const StadiumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  capacityLevel: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
});

const ResultsSchema = new mongoose.Schema({
  gameId: {
    type: Schema.Types.ObjectId,
    ref: "Game",
  },
});

const RetrospectSchema = new mongoose.Schema({
  result: {
    type: String,
  },
  gameId: {
    type: Schema.Types.ObjectId,
    ref: "Game",
  },
});

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
  },
  pictureUrl: {
    type: String,
    require: true,
  },
  countryId: {
    type: Schema.Types.ObjectId,
    ref: "Country",
    require: true,
  },
  regionId: {
    type: Schema.Types.ObjectId,
    ref: "Region",
    required: true,
  },
  regionalCompetitionId: {
    type: Schema.Types.ObjectId,
    ref: "EliminatoryCompetition",
  },
  nacionalCompetitionId: {
    type: Schema.Types.ObjectId,
    ref: "RunningPointsCompetition",
    required: true,
  },
  results: [ResultsSchema],
  coachId: {
    type: Schema.Types.ObjectId,
    ref: "Coach",
  },
  presidentId: {
    type: Schema.Types.ObjectId,
    ref: "President",
  },
  sponsorshipId: {
    type: Schema.Types.ObjectId,
    ref: "Sponsorship",
  },
  stadium: StadiumSchema,
  funds: FundsSchema,
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  negociabilityLevel: {
    type: Number,
    required: true,
  },
  tenders: [TeamTendersSchema],
  interestedCoaches: [InterestCoaches],
  retrospect: [RetrospectSchema],
  lineup: LineupSchema,
  tatics: TaticsSchema,
});

const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;
