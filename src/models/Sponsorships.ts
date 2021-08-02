import mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SponsorshipSchema = new Schema({
  name: {
    required: true,
    type: String,
  },
  value: {
    required: true,
    type: Number,
  },
  type: {
    required: true,
    type: String,
  },
  level: {
    required: true,
    type: Number,
  },
  pictureUrl: {
    required: true,
    type: String,
  },
});

const Sponsorship = mongoose.model("Sponsorship", SponsorshipSchema);
module.exports = Sponsorship;
