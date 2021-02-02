import {Request, Response} from 'express'
const Country = require('../models/Countries')
const Region = require('../models/Regions')
const RunningPointsCompetition = require('../models/RunningPointsCompetitions')

export default {

    async create(req:Request, res:Response){

        const {name, pictureUrl, countryRegionId, mainNacionalCompetitionName, mainNacionalCompetitionnumberOfTeams,secondaryNacionalCompetitionName , secondaryNacionalCompetitionnumberOfTeams, pictureUrlMain, pictureUrlSecondary} = req.body
        const mainNacionalCompetitionData = {name: mainNacionalCompetitionName, numberOfTeams: mainNacionalCompetitionnumberOfTeams, countryId: "", pictureUrl: pictureUrlMain}
        const secondaryNacionalCompetitionData = {name: secondaryNacionalCompetitionName, numberOfTeams: secondaryNacionalCompetitionnumberOfTeams, countryId: "", pictureUrl: pictureUrlSecondary}

        try {

            if(await Country.findOne({ name: name })){
                return res.status(400).send({ error: 'This country already exist'})
            }

            if(!await Region.findOne({ _id: countryRegionId })){
                return res.status(400).send({ error: 'This region does not exist'})
            }

            const CountryRegion = await Region.findOne({ _id: countryRegionId })
            const regionId = CountryRegion.id

            const countryData = {name, pictureUrl, regionId}

            await Country.create(countryData)

            const country = await Country.findOne({name})

            mainNacionalCompetitionData.countryId = country._id
            secondaryNacionalCompetitionData.countryId = country._id

            const mainNacionalCompetition = await RunningPointsCompetition.create(mainNacionalCompetitionData)
            const secondaryNacionalCompetition = await RunningPointsCompetition.create(secondaryNacionalCompetitionData)

            country.mainNacionalCompetitionId = mainNacionalCompetition._id
            country.secondaryNacionalCompetitionId = secondaryNacionalCompetition._id

            const data = await country.save()

            return res.status(201).send({data})

        } catch (err) {
            return res.status(400).send({ error: 'failed to create' + err})
        }
    },

    async getCountries(req:Request, res:Response) {

        const {regionId} = req.params

        try {

            const region = await Region.findOne({_id: regionId})

            if(!region){
                return res.status(400).send({ error: 'This region not exist'})
            }

            const countries = await Country.find({regionId: regionId}).select('-regionId').select('-mainNacionalCompetitionId').select('-secondaryNacionalCompetitionId').select('-__v')

            if(!countries) {
                return res.status(400).send({ error: 'Not have a country in this'})
            }

            return res.status(200).send({countries})
            
        } catch (err) {
            return res.status(400).send({ error: 'failed to get' + err})
        }

    },

    async getLeagues(req:Request, res:Response) {

        const {countryId} = req.params

        try {

            const country = await Country.findOne({_id: countryId})

            if(!country){
                return res.status(400).send({ error: 'This country does not exist'})
            }

            const leagues = await RunningPointsCompetition.find({countryId: countryId}).select('-numberOfTeams').select('-qualifyForMainRegionalCompetition').select('-qualifyForSecondaryRegionalCompetition').select('-winnerId').select('-award').select('-teams').select('-__v').select('-countryId')

            if(!leagues) {
                return res.status(400).send({ error: 'Not have a country in this'})
            }

            return res.status(200).send({leagues})
            
        } catch (err) {
            return res.status(400).send({ error: 'failed to get' + err})
        }

    },

    async getCountriesList(req:Request, res:Response) {

        try {
            
            const countries = await Country.find()

            return res.status(200).send({countries})

        } catch (err) {
            return res.status(200).send({ error: 'failed to get' + err})
        }

    }
    
}