const President = require('../models/Presidents')
const User = require('../models/Users')
import {Request, Response} from 'express'
const jwt = require('jsonwebtoken')
import jwt_decode from 'jwt-decode'

interface data {
    id: string,
}

const authConfig = require('../config/auth.json')

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

export default {

    async create(req: Request, res: Response){
        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        const user = await User.findOne({ _id: id })

        try {
            if(await President.findOne({ username: user.username })){
                return res.status(400).send({ error: 'You are already registered'})
            }

            await User.findOne({ username: user.username }).update({profession: "President"})

            const presidentData = {
                username: user.username,
                userId: id,
            }

            const president = await President.create(presidentData)

            return res.status(201).send({ president, token: generateToken({ id: president.userId, profession: 'President'}) })

        } catch (err) {
            return res.status(400).send({ error: 'Operation failed' + err})
        }
    },

    async getPresident(req: Request, res: Response){
        try {
            const {authorization} = req.headers

            const tokenSplited = authorization.split(' ') 

            const token = tokenSplited[1]

            const data: data = jwt_decode(token)

            const {id} = data

            const president = await President.findOne({ userId: id })

            return res.status(201).send({ president })

        } catch (err) {
            return res.status(400).send({ error: 'Operation failed' + err})
        }
    },

    async getIndex(req: Request, res: Response){

    },

    async getAll(req: Request, res: Response){

    },

    async changeTeam(req: Request, res: Response){
        
    }

}