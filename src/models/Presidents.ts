const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ActiveMandateSchema = new mongoose.Schema({
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    initialDate: {
      type: Date,
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

const PresidentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
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
      required: true,
      ref: 'Country',
    },
    description: {
      type: String,
    },
    activeMandate: ActiveMandateSchema,
    career: [
        CareerSchema,
    ]
})


const President = mongoose.model('President', PresidentSchema)
module.exports = President
