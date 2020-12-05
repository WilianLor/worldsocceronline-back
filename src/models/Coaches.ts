const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ActiveContractSchema = new mongoose.Schema({
  team: {
    type: String,
  },
  initialDate: {
    type: Date,
  },
  salary: {
    type: Number,
  },
  fineTermination: {
    type: Number,
  },
  monthsDuration: {
    type: Number,
  }
})

const CareerSchema = new mongoose.Schema({
  team: {
    type: String
  },
  winRating: {
    type: Number,
  },
  monthsDuration: {
    type: Number,
  }
})

const CoachSchema = new mongoose.Schema({
  username: {
    type:String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  team: {
    type: String,
  },
  activeContract: ActiveContractSchema,
  career: [
    CareerSchema,
  ]
})


const Coach = mongoose.model('Coach', CoachSchema)
module.exports = Coach
