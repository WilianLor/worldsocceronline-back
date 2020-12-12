const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TeamPositionSchema = new mongoose.Schema({
    teamId: {
        type: Number,
        require: true
    },
    points: {
        type: Number,
    },
    games: {
        type: Number,
    },
    victories: {
        type: Number,
    },
    draws: {
        type: Number,
    },
    defeats: {
        type: Number,
    }
})

const GroupSchema = new mongoose.Schema({
    team1: TeamPositionSchema,
    team2: TeamPositionSchema,
    team3: TeamPositionSchema,
    team4: TeamPositionSchema
})

const RunningPointsCompetitionSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    numberOfTeams: {
        type: Number,
        require: true
    },
    groupA: GroupSchema,
    groupB: GroupSchema,
    groupC: GroupSchema,
    groupD: GroupSchema,
    groupE: GroupSchema,
    groupF: GroupSchema,
    groupG: GroupSchema,
    groupH: GroupSchema,
})