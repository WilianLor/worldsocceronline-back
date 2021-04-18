const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CoachTendersSchema = new mongoose.Schema({
  tendersId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenders',
  },
  method: {
    type: String
  }
})

const ActiveContractSchema = new mongoose.Schema({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
  },
  initialDate: {
    type: Date,
  },
  salary: {
    type: Number,
  },
  monthsDuration: {
    type: Number,
  }
})

const CareerSchema = new mongoose.Schema({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
  },
  initialDate: {
    type: Date,
  },
  finalDate: {
    type: Date
  }
})

const interestTeamsSchema =  new mongoose.Schema({
  teamId: {
    type: Schema.Types.ObjectId,
        ref: 'Team',
  }
})

const CoachSchema = new mongoose.Schema({
  username: {
    type:String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
  },
  countryId: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    require: true
  },  
  description: {
    type: String,
  },
  activeContract: ActiveContractSchema,
  career: [
    CareerSchema,
  ],
  interestTeams: [interestTeamsSchema],
  tenders: [CoachTendersSchema]
})


const Coach = mongoose.model('Coach', CoachSchema)
module.exports = Coach
