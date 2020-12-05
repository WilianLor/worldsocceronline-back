const User = require('../models/Users')
import {Request, Response} from 'express'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../modules/mailer')

const authConfig = require('../config/auth.json')

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

export default {

    async create(req:Request, res:Response){
        const {email, username} = req.body

        try {
            if(await User.findOne({ email })){
                return res.status(400).send({ error: 'User already exists'})
            }

            if(await User.findOne({ username })){
                return res.status(400).send({ error: 'User already exists'})
            }

            const user = await User.create(req.body)

            user.password = undefined

            return res.send({ user, token: generateToken({ id: user.id }) })
        } catch (err) {
            return res.status(400).send({ error: 'Registration failed' + err})
        }
    },

    async login(req:Request, res:Response){
        const { username, password } = req.body

        const user = await User.findOne({ username }).select('+password')
        if(!user){
            return res.status(400).send({ error: 'User not found' })
        }

        if(!await bcrypt.compare(password, user.password)){
            return res.status(400).send({ error: 'Invalid password' })
        }

        user.password = undefined

        res.send({ user, token: generateToken({ id: user.id, profession: user.profession}) })
    },

    async forgotPassword(req:Request, res:Response) {
        const {email} = req.body


        try{

            const user = await User.findOne({ email })

            if(!user){
                return res.status(400).send({error: 'User not found'})
            }

            const token = crypto.randomBytes(20).toString('hex')

            const now = new Date()
            now.setHours(now.getHours() + 1)

            await User.findByIdAndUpdate(user.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now,
                }
            })

            mailer.sendMail({
                to: email,
                from: 'wl24player@gmail.com',
                html: 'Esqueceu sua senha? Não tem problema, resete-a com este token : '+token,
            }, (err) => {
              if(err){
                  return res.status(400).send({error: 'Cannot send email'+err});
              } 
              
              res.status(200).send({message: 'Email sent'})
            })       

        } catch (err) {
            res.status(400).send({ error: 'Error on forgot password, try again'+err})
        }
    },

    async resetPassword(req: Request, res: Response) {
        const {email, token, password} = req.body
        
        try {
            
            const user = await User.findOne({ email: email }).select('+passwordResetToken passwordResetExpires')

            if(!user) {
                return res.status(400).send({ error: 'User not found' })
            }

            if(token !== user.passwordResetToken) {
                return res.status(400).send({ error: 'Token invalid' })
            }

            const now = new Date()

            if(now > user.passwordResetExpires) {
                return res.status(400).send({ error: 'Token expired, generate a new one' })
            }

            user.password = password

            await user.save()
            
            return res.status(200).send({ message: 'Password has been updated' })

        } catch (error) {
            res.status(400).send({error: 'Cannot reset password, try again'})
        }
    }

}