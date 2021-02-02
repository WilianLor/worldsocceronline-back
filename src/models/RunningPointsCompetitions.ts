const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TeamSchema = new mongoose.Schema({
    name: {
        type:String,
    },
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
    },
    goalDifference: {
        type: Number
    }
})

const GameSchema = new mongoose.Schema({
    visitingTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
    },
    homeTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
    },
    gameId: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
    },
    winnerId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
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
    teams: [TeamSchema],
    qualifyForMainRegionalCompetition: RegionalCompetition,
    qualifyForSecondaryRegionalCompetition: RegionalCompetition,
    winnerId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
    },
    award: {
        type: Number
    }
})

const RunningPointsCompetition = mongoose.model('RunningPointsCompetition', RunningPointsCompetitionSchema)
module.exports = RunningPointsCompetition