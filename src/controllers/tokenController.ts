import {Request, Response} from 'express'
const jwt = require('jsonwebtoken')

const authConfig = require('../config/auth.json')

export default {
    async verify(req: Request, res: Response){
        const { token } = req.params

        if(!token) {
            return res.status(401).send({ error: 'No token provided'})
        }
    
        jwt.verify(token, authConfig.secret, (err) => {
            if(err){
                return res.status(401).send({ error: 'Token Invalid' })
            }
    
            return res.status(200).send({ message: 'Token Valid' })
        })
    }
}