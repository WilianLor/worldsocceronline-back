const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TendersSchema = new mongoose.Schema({
    method: {
        type: String,
    },
    coachId: {
        type: Number,
        required: true
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
        type: Number,
        require: true
    },
    regionId: {
        type: Number,
        require: true
    },
    regionalCompetitionId: {
        type: Number
    },
    nacionalCompetitionId: {
        type: Number,
        require: true
    },
    coachId: {
        type: Number
    },
    presidentId: {
        type: Number
    },
    tenders: [TendersSchema]
})

const Team = mongoose.model('Team', TeamSchema)
module.exports = Team