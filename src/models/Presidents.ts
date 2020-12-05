const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ActiveMandateSchema = new mongoose.Schema({
    team: {
      type: String,
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

const PresidentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    }, 
    userId: {
      type: String,
      required: true
    },
    team: {
        type: String,
    },
    activeMandate: ActiveMandateSchema,
    career: [
        CareerSchema,
    ]
})


const President = mongoose.model('President', PresidentSchema)
module.exports = President
