const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TendersSchema = new mongoose.Schema({
  method: {
      type: String,
  },
  coachId: {
      type: Number,
  },
  date: {
      type: Date(),
  },
  durationInMonths: {
      type: Number,
  },
  salary: {
      type: Number,
  },
  contractPlan: {
      type:String,
  }
})

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
  ],
  tenders: [TendersSchema]
})


const Coach = mongoose.model('Coach', CoachSchema)
module.exports = Coach
