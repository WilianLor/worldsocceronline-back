const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TeamSchema = new mongoose.Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
    },
    position: {
        type:Number
    },
    victories: {
        type: Number
    },
    draws: {
        type: Number
    },
    defeats: {
        type: Number
    },
    concededGoals: {
        type: Number
    },
    goalsScored: {
        type: Number
    }
})

const RegionalCompetition = new mongoose.Schema({
    competitionId: {
        type: Schema.Types.ObjectId,
        ref: 'EliminatorylCompetition',
    },
    minPositionForQualify: {
        type: Number
    },
    maxPositionForQualify: {
        type: Number
    }
})

const GamesSchema = new mongoose.Schema({
    gameId: Schema.Types.ObjectId,
})

const RunningPointsCompetitionSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    pictureUrl: {
        type: String,
        require: true
    },
    numberOfTeams: {
        type: Number,
        require: true
    },
    countryId: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        require: true
    },
    games: [GamesSchema],
    teams: [TeamSchema],
    qualifyForMainRegionalCompetition: RegionalCompetition,
    qualifyForSecondaryRegionalCompetition: RegionalCompetition,
    award: {
        type: Number
    }
})

const RunningPointsCompetition = mongoose.model('RunningPointsCompetition', RunningPointsCompetitionSchema)
module.exports = RunningPointsCompetition