const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TeamTendersSchema = new mongoose.Schema({
    tendersId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenders',
    },
    method: {
        type: String
    }
  })

const InterestCoaches = new mongoose.Schema({
    coachId: {
        type: Schema.Types.ObjectId,
        ref: 'Coach',
    } 
})

const FundsSchema = new mongoose.Schema({
    total: {
        type: Number,
        required: true
    },
    percentageForTransfers: {
        type: Number,
        required: true
    },
    percentageForSalary: {
        type: Number,
        required: true
    }
})

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    pictureUrl: {
        type: String,
        require: true
    },
    countryId: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        require: true
    },
    regionId: {
        type: Schema.Types.ObjectId,
        ref: 'Region',
        required: true
    },
    regionalCompetitionId: {
        type: Schema.Types.ObjectId,
        ref: 'EliminatoryCompetition',
    },
    nacionalCompetitionId: {
        type: Schema.Types.ObjectId,
        ref: 'RunningPointsCompetition',
        required: true
    },
    coachId: {
        type: Schema.Types.ObjectId,
        ref: 'Coach'
    },
    presidentId: {
        type: Schema.Types.ObjectId,
        ref: 'President'
    },
    founds: FundsSchema,
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'Player'
    }],
    tenders: [TeamTendersSchema],
    interestedCoaches: [InterestCoaches]
})

const Team = mongoose.model('Team', TeamSchema)
module.exports = Team