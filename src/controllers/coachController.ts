const Coach = require('../models/Coaches')
const President = require('../models/Presidents')
const User = require('../models/Users')
const Team = require('../models/Teams')
import {Request, Response} from 'express'
const jwt = require('jsonwebtoken')
import jwt_decode from 'jwt-decode'

interface data {
    id: string,
}

interface interest {
    _id: string,
    teamId: string
}

const authConfig = require('../config/auth.json')

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

export default {

    async create(req:Request, res:Response){
        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        const user = await User.findOne({ _id: id })

        try {
            if(await Coach.findOne({ username: user.username })){
                return res.status(400).send({ error: 'You are already registered'})
            }

            await User.findOne({ username: user.username }).update({profession: "Coach"})

            const coachData = {
                username: user.username,
                userId: id,
                countryId: user.countryId,
            }

            const coach = await Coach.create(coachData)

            const data = {
                token: generateToken({ id: coach.userId, profession: 'Coach'}),
                profession: "Coach",
                user: {
                    userId: user._id,
                    professionId: coach._id,
                    username: user.username,
                    country: user.country,
                    teamId: "",
                    admin: user.admin,
                    passwordVersion: user.passwordVersion
                }
            } 
    
            return res.status(201).send({ data })

        } catch (err) {
            return res.status(400).send({ error: 'Operation failed' + err})
        }
    },

    async getCoaches(req: Request, res: Response) {

        const {coachName, onlyInterested, countryId} = req.params

        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        try {

            let coaches = []

            const president = await President.findOne({ userId: id })

            if(!president || !president.teamId) {
                return res.status(400).send({error: 'User not found.'})
            }

            if(countryId != 'null') {

                coaches = await Coach.find({countryId: countryId}).populate(['countryId', 'teamId'])

            } else {

                coaches = await Coach.find({}).populate(['countryId', 'teamId'])
            }

            let filtredCoaches = []

            if(onlyInterested != 'false') {     
                coaches.map(coach => {
                    coach.interestTeams.map((interest: interest) => {
                        if(JSON.stringify(interest.teamId) === JSON.stringify(president.teamId)) {
                            filtredCoaches.push(coach)
                        }
                    })
                })

            } else{
                filtredCoaches = coaches
            }

            let finalCoaches = []

            if(coachName != 'null') {
                filtredCoaches.map(coach => {
                    if(coach.username.toLowerCase().indexOf(coachName.toLowerCase()) >= 0) {
                        finalCoaches.push(coach)
                    }
                })
            }else {
                finalCoaches = filtredCoaches
            }

            console.log(finalCoaches)

            return res.status(200).send(finalCoaches)
            
        } catch (err) {
            return res.status(400).send({error: 'Operation failed'+ err})
        }
    },

    async getCoach(req: Request, res: Response){
        
            const {authorization} = req.headers

            const tokenSplited = authorization.split(' ') 

            const token = tokenSplited[1]

            const data: data = jwt_decode(token)

            const {id} = data

            try {

            const coach = await Coach.findOne({ userId: id })

            return res.status(201).send({ coach })

        } catch (err) {
            return res.status(400).send({ error: 'Operation failed' + err})
        }
    },

    async showInterest(req: Request, res: Response){

        const {teamId} = req.body
        
        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ')

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        try {

            const coach = await Coach.findOne({userId : id})

            const team = await Team.findOne({ _id : teamId})
            
            if(!coach){
                return res.status(400).send({error: 'Coach not found'})
            }

            if(!team){
                return res.status(400).send({error: 'Team not found'})
            }

            if(coach.teamId === teamId){
                return res.status(400).send({error: 'Coach already in this team'})
            }

            let alreadyShowInterest = 0

            coach.interestTeams.map(interest => {
                if(interest.teamId === team._id){
                    alreadyShowInterest = alreadyShowInterest + 1
                }
            })

            if(alreadyShowInterest > 0){
                return res.status(400).send({error: 'Coach already show interest in this team'})
            }

            coach.interestTeams.push({teamId})
            team.interestedCoaches.push({coachId: coach._id})

            await coach.save()
            await team.save()

            return res.status(200).send(coach.interestTeams)

        } catch (err) {
            return res.status(400).send({error: 'Error: '+err})
        }
    },

    async removeInterest(req:Request, res:Response){

        const {teamId} = req.body

        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ')

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        try {
            
            const coach = await Coach.findOne({userId: id})

            const team = await Team.findOne({ _id : teamId})

            if(!coach){
                return res.status(400).send({error: 'Coach not found'})
            }

            if(!team){
                return res.status(400).send({error: 'Team not found'})
            }


            let interestIndex
            let interestIndex2 

            coach.interestTeams.map((interest, index) => {
                if(interest.teamId == teamId){
                    interestIndex = index
                }
            })

            team.interestedCoaches.map((interest, index) => {
                if(interest.coachId == coach._id){
                    interestIndex2 = index
                }
            })

            let removed

            if(interestIndex >= 0){
                removed = coach.interestTeams.splice(interestIndex, 1)
                team.interestedCoaches.splice(interestIndex2, 1)
            }else{
                return res.status(400).send({error: 'Coach has not interest in this team'})
            }

            await coach.save()
            await team.save()

            return res.status(200).send({message: 'Interest removed: '+removed})

        } catch (err) {
            return res.status(400).send({error: 'Error: '+err})
        }

    },

    async leaveTeam(req:Request, res:Response){
        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ')

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        try {

            const coach = await Coach.findOne({userId: id})

            if(!coach) {
                return res.status(400).send({error: 'Coach id is invalid'})
            }

            if(coach.teamId === undefined){
                return res.status(400).send({error: 'This coach dont have a team'})
            }

            const team = await Team.findOne({_id: coach.teamId})

            if(!team){
                return res.status(400).send({error: 'Team id is invalid'})
            }

            team.coachId = undefined

            coach.teamId = undefined

            const date = new Date()

            const career = {
                teamId: coach.activeContract.teamId,
                initialDate: coach.activeContract.initialDate,
                finalDate: date
            }

            coach.career.push(career)

            coach.activeContract = undefined

            await coach.save()
            await team.save()

            return res.status(200).send({message: 'Coach leave of the team'})
            
        } catch (err) {
            return res.status(400).send({error: 'Error: '+err})
        }
    }

}