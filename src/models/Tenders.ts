const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TendersSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    coachId: {
        type: Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    monthsDuration: {
        type: Number,
        required: true,
    },
    salary: {
        type: Number,
        required: true
    },
    terminationFine: {
        type: Number,
    },
    contractPlan: {
        type:String,
        required: true
    }
})

const Tenders = mongoose.model('Tenders', TendersSchema)
module.exports = Tenders