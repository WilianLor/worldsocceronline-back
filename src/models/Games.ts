const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GoalsSchema = new mongoose.Schema({
    visitor: {
        type: Number
    },
    home: {
        type: Number
    }
})

const BallPossessionSchema = new mongoose.Schema({
    visitor: {
        type: Number
    },
    home: {
        type: Number
    }
})

const YellowCardsSchema = new mongoose.Schema({
    visitor: {
        type: Number
    },
    home: {
        type: Number
    }
})

const RedCardsSchema = new mongoose.Schema({
    visitor: {
        type: Number
    },
    home: {
        type: Number
    }
})

const FoulsSchema = new mongoose.Schema({
    visitor: {
        type: Number
    },
    home: {
        type: Number
    }
})

const ShotsSchema = new mongoose.Schema({
    visitor: {
        type: Number
    },
    home: {
        type: Number
    }
})

const PassesSchema = new mongoose.Schema({
    visitor: {
        type: Number
    },
    home: {
        type: Number
    }
})

const CornersSchema = new mongoose.Schema({
    visitor: {
        type: Number
    },
    home: {
        type: Number
    }
})

const PlayerTotalSchema = new mongoose.Schema({
    playerId: {
        type: Schema.Types.ObjectId
    },
    total: {
        type: Number,
    }
})

const GameSchema = new mongoose.Schema({
    homeTeamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
    },
    visitorTeamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
    },
    goals: GoalsSchema,
    ballPossession: BallPossessionSchema,
    yellowCards: YellowCardsSchema,
    redCards: RedCardsSchema,
    fouls: FoulsSchema,
    shots: ShotsSchema,
    passes: PassesSchema,
    corners: CornersSchema,
    assistantPlayers: [PlayerTotalSchema],
    scoringPlayers: [PlayerTotalSchema],
    yellowishPlayers: [PlayerTotalSchema],
    reddisPlayers: [PlayerTotalSchema],
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    competitionId: {
        type: Schema.Types.ObjectId,
        required: true,
    }
})

const Games = mongoose.model('Game', GameSchema)
module.exports = Games