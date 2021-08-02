const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  pictureUrl: {
    type: String,
    require: true,
  },
  regionId: {
    type: Schema.Types.ObjectId,
    ref: "Region",
    require: true,
  },
  mainNacionalCompetitionId: {
    type: Schema.Types.ObjectId,
    ref: "RunningPointsCompetition",
  },
  secondaryNacionalCompetitionId: {
    type: Schema.Types.ObjectId,
    ref: "RunningPointsCompetition",
  },
});

const Country = mongoose.model("Country", CountrySchema);
module.exports = Country;
