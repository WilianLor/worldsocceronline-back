const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RegionSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    mainRegionalCompetitionId: {
        type: Number
    },
    secondaryRegionalCompetitionId: {
        type: Number
    }
})

const Region = mongoose.model('Region', RegionSchema)
module.exports = Region
