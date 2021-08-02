const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActiveContract = new mongoose.Schema({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: "Team",
  },
  salary: {
    type: Number,
  },
  initialDate: {
    type: Date,
  },
  finalDate: {
    type: Date,
  },
  terminationFine: {
    type: Number,
  },
});

const CareerSchema = new mongoose.Schema({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: "Team",
  },
  initialDate: {
    type: Date,
  },
  finalDate: {
    type: Date,
  },
});

const PlayerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  overall: {
    type: Number,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  countryId: {
    type: Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: "Team",
  },
  transferAmount: {
    type: Number,
    required: true,
  },
  baseSalary: {
    type: Number,
    required: true,
  },
  activeContract: ActiveContract,
  career: CareerSchema,
});

const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;
