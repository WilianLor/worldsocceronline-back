const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CountrySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    pictureUrl: {
        type: String,
        require: true
    },
    regionId: {
        type: Number,
        require: true
    },
    mainNacionalCompetitionId: {
        type: Number
    },
    secondaryNacionalCompetitionId: {
        type: Number
    }
})

const Country = mongoose.model('Country', CountrySchema)
module.exports = Country