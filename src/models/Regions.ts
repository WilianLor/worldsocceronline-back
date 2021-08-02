const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RegionSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  mainRegionalCompetitionId: {
    type: Schema.Types.ObjectId,
    ref: "EliminatoryCompetition",
  },
  secondaryRegionalCompetitionId: {
    type: Schema.Types.ObjectId,
    ref: "EliminatoryCompetition",
  },
});

const Region = mongoose.model("Region", RegionSchema);
module.exports = Region;
