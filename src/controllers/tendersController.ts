const Tenders = require('../models/Tenders')
const Coach = require('../models/Coaches')
const Team = require('../models/Teams')
const President = require('../models/Presidents')

import jwt_decode from 'jwt-decode'

interface data {
    id: string,
}

import {Request, Response} from 'express'

export default {

    async teamSend(req:Request, res:Response){

        const {coachId, monthsDuration, salary, contractPlan} = req.body

        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        try {
            
            const president = await President.findOne({userId: id})

            const coach = await Coach.findOne({_id: coachId})

            if(!president){
                return res.status(400).send({error: 'President not found'})
            }

            if(president.teamId === undefined){
                return res.status(400).send({error: 'President does not has a team'})
            }

            if(!coach){
                return res.status(400).send({error: 'Coach not found'})
            }

            if(coach.teamId === president.teamId){
                return res.status(400).send({error: 'Coach already in this team'})
            }

            const teamId = president.teamId

            if(await Tenders.findOne({ teamId: teamId, coachId: coach._id })){
                return res.status(400).send({error: 'Already have a tender with this team and this coach'})
            }

            const team = await Team.findOne({_id: president.teamId})

            if(!team){
                return res.status(400).send({error: 'Team not found'})
            }

            const date = new Date()

            const tenderData = {
                sender: 'Team',
                coachId: coach._id,
                teamId: president.teamId,
                date,
                monthsDuration,
                salary,
                contractPlan
            }

            const tender = await Tenders.create(tenderData)

            team.tenders.push({tendersId: tender._id, method: 'Send'})

            await team.save()

            coach.tenders.push({tendersId: tender._id, method: 'Receive'})

            await coach.save()

            return res.status(201).send(tender)

        } catch (err) {
            return res.status(400).send({error: 'Error: '+err})
        }

    },

    async coachCounteroffer(req:Request, res: Response){
        
        const {tenderId} = req.params

        const { monthsDuration, salary, contractPlan} = req.body

        const {authorization} = req.headers

        let isTenderCoach = false

        let isTenderTeam = false

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        try {
            
            const tender = await Tenders.findOne({ _id: tenderId})

            if(!tender){
                return res.status(400).send({error: 'Terder id is invalid'})
            }

            if(tender.sender === 'Coach'){
                return res.status(400).send({error: 'Coach already send a counteroffer'})
            }

            const coach = await Coach.findOne({ userId: id})

            if(!coach){
                return res.status(400).send({error: 'Coach id is invalid'})
            }

            coach.tenders.map(tender => {
                if(tender.tendersId == tenderId){
                    tender.method = 'Send'
                    isTenderCoach = true
                }
            })

            const team = await Team.findOne({ _id: tender.teamId})

            if(!team){
                return res.status(400).send({error: 'Team id is invalid'})
            }

            team.tenders.map(tender => {
                if(tender.tendersId == tenderId){
                    tender.method = 'Receive'
                    isTenderTeam = true
                }
            })

            if(isTenderCoach === false || isTenderTeam === false){
                return res.status(400).send({error: 'Not have a tender in comum with this team and this coach'})
            }

            tender.monthsDuration = monthsDuration
            tender.salary = salary
            tender.contractPlan = contractPlan
            tender.sender = 'Coach'

            await coach.save()
            await team.save()
            await tender.save()

            return res.status(200).send(tender)

        } catch (err) {
            return res.status(400).send({error: 'Error: '+err})
        }
    },

    async teamCounteroffer(req:Request, res: Response){

        const {tenderId} = req.params

        const { monthsDuration, salary, contractPlan} = req.body

        const {authorization} = req.headers

        let isTenderCoach = false

        let isTenderTeam = false

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        try {
            
            const tender = await Tenders.findOne({ _id: tenderId})

            const president = await President.findOne({ userId: id})

            if(!president){
                return res.status(400).send({error: 'Presidente inválido'})
            }

            if(!tender){
                return res.status(400).send({error: 'Terder id is invalid'})
            }

            if(tender.sender === 'Team'){
                return res.status(400).send({error: 'Team already send a counteroffer'})
            }

            const coach = await Coach.findOne({ _id: tender.coachId})

            console.log('coach', coach)

            if(!coach){
                return res.status(400).send({error: 'Coach id is invalid'})
            }

            coach.tenders.map(tender => {
                if(tender.tendersId == tenderId){
                    tender.method = 'Receive'
                    isTenderCoach = true
                }
            })

            const team = await Team.findOne({ _id: tender.teamId})


            if(!team){
                return res.status(400).send({error: 'Team id is invalid'})
            }

            if(team.presidentId !=  president._id){
                return res.status(400).send({error: 'This president dont camand this team'})
            }

            team.tenders.map(tender => {
                if(tender.tendersId == tenderId){
                    tender.method = 'Send'
                    isTenderTeam = true
                }
            })

            if(isTenderCoach === false || isTenderTeam === false){
                return res.status(400).send({error: 'Not have a tender in comum with this team and this coach'})
            }

            tender.monthsDuration = monthsDuration
            tender.salary = salary
            tender.contractPlan = contractPlan
            tender.sender = 'Team'

            await coach.save()
            await team.save()
            await tender.save()

            return res.status(200).send(tender)

        } catch (err) {
            return res.status(400).send({error: 'Error: '+err})
        }
    },

    async coachAction(req:Request, res: Response){

        const {acceptOrCancel, tenderId} = req.params

        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        let indexTeamToRemove 
        let indexCoachToRemove 

        try {

            const coach = await Coach.findOne({userId: id})

            const tender = await Tenders.findOne({ _id: tenderId})

            if(!tender){
                return res.status(400).send({error: 'Tenders id is invalid'})
            }

            const team = await Team.findOne({ _id: tender.teamId})

            if(!team){
                return res.status(400).send({error: 'Team is invalid'})
            }

            if(!coach){
                return res.status(400).send({error: 'Coach id is invalid'})
            }

            if(!tender.coachId === coach._id){
                return res.status(400).send({error: 'This coach dont have acces to this tender'})
            }

           if(acceptOrCancel === 'accept'){

                if(tender.sender === 'Coach'){
                    return res.status(400).send({error: 'Coach cannot accept'})
                }

                team.coachId = coach._id

                team.tenders.map((tender, index) => {
                    if(tender.tendersId == tenderId){
                        indexTeamToRemove = index
                    }
                })

                team.tenders.splice(indexTeamToRemove, 1)

                coach.teamId = team.id

                const date = new Date()

                const activeContract = {
                    teamId: team.id,
                    initialDate: date,
                    salary: tender.salary,
                    monthsDuration: tender.monthsDuration
                }

                coach.activeContract = activeContract

                coach.tenders.map((tender, index) => {
                    if(tender.tendersId == tenderId){
                        indexCoachToRemove = index
                    }
                })

                coach.tenders.splice(indexCoachToRemove, 1)

                await Tenders.remove({_id: tenderId})
                await coach.save()
                await team.save()

                return res.status(200).send({message: 'Tender accepted'})

           }
           else if(acceptOrCancel === 'cancel'){

                team.tenders.map((tender, index) => {
                    if(tender.tendersId == tenderId){
                        indexTeamToRemove = index
                    }
                })

                team.tenders.splice(indexTeamToRemove, 1)

                coach.tenders.map((tender, index) => {
                    if(tender.tendersId == tenderId){
                        indexCoachToRemove = index
                    }
                })

                coach.tenders.splice(indexCoachToRemove, 1)

                await Tenders.remove({_id: tenderId})
                await coach.save()
                await team.save()

                return res.status(200).send({message: 'Tender removed'})

           }
           else {
               return res.status(400).send({error: 'Method invalid'})
           }
            
        } catch (err) {
            return res.status(400).send({error: 'Error: '+err})
        }

    },

    async teamAction(req:Request, res: Response){
        const {acceptOrCancel, tenderId} = req.params

        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        let indexTeamToRemove 
        let indexCoachToRemove 

        try {
            const president = await President.findOne({ userId: id})

            const tender = await Tenders.findOne({ _id: tenderId})

            const coach = await Coach.findOne({_id: tender.coachId})

            const team = await Team.findOne({ _id: tender.teamId})

            if(!president){
                return res.status(400).send({error: 'President id is invalid'})
            }

            if(!tender){
                return res.status(400).send({error: 'Tenders id is invalid'})
            }

            if(!tender.teamId === president.teamId){
                return res.status(400).send({error: 'This president dont comand this team '+president.teamId+' '+tender.teamId})
            }

            if(!team){
                return res.status(400).send({error: 'Team is invalid'})
            }

            if(!coach){
                return res.status(400).send({error: 'Coach id is invalid gh'})
            }

            if(!tender.coachId === coach._id){
                return res.status(400).send({error: 'This coach dont have acces to this tender'})
            }

           if(acceptOrCancel === 'accept'){

                if(tender.sender === 'Team'){
                    return res.status(400).send({error: 'Coach cannot accept'})
                }

                team.coachId = coach._id

                team.tenders.map((tender, index) => {
                    if(tender.tendersId == tenderId){
                        indexTeamToRemove = index
                    }
                })

                team.tenders.splice(indexTeamToRemove, 1)

                coach.teamId = team.id

                const date = new Date()

                const activeContract = {
                    teamId: team.id,
                    initialDate: date,
                    salary: tender.salary,
                    monthsDuration: tender.monthsDuration
                }

                coach.activeContract = activeContract

                coach.tenders.map((tender, index) => {
                    if(tender.tendersId == tenderId){
                        indexCoachToRemove = index
                    }
                })

                coach.tenders.splice(indexCoachToRemove, 1)

                await Tenders.remove({_id: tenderId})
                await coach.save()
                await team.save()

                return res.status(200).send({message: 'Tender accepted'})

           }
           else if(acceptOrCancel === 'cancel'){

                team.tenders.map((tender, index) => {
                    if(tender.tendersId == tenderId){
                        indexTeamToRemove = index
                    }
                })

                team.tenders.splice(indexTeamToRemove, 1)

                coach.tenders.map((tender, index) => {
                    if(tender.tendersId == tenderId){
                        indexCoachToRemove = index
                    }
                })

                coach.tenders.splice(indexCoachToRemove, 1)

                await Tenders.remove({_id: tenderId})
                await coach.save()
                await team.save()

                return res.status(200).send({message: 'Tender removed'})

           }
            
        } catch (err) {
            return res.status(400).send({error: 'Error: '+err})
        }
    }
}