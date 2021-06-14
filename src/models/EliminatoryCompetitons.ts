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

const GroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
    },
    teams: [TeamSchema]
})

const GamesSchema = new mongoose.Schema({
    gameId: Schema.Types.ObjectId,
})

const EliminatoryCompetitionSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    regionId: {
        type: Schema.Types.ObjectId,
        ref: 'Region',
        required: true
    },
    pictureUrl: {
        type: String,
        require: true
    },
    numberOfTeams: {
        type: Number,
        require: true
    },
    group: [GroupSchema],
    roundOf16Games:[GamesSchema],
    quarterFinalsGames:[GamesSchema],
    semiFinalsGames:[GamesSchema],
    finalGame: GamesSchema,
    winnerId: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    award: {
        type: Number
    }
})

const EliminatoryCompetition = mongoose.model('EliminatoryCompetition', EliminatoryCompetitionSchema)
module.exports = EliminatoryCompetition