const User = require('../models/Users')
const Coach = require('../models/Coaches')
const President = require('../models/Presidents')
import {Request, Response} from 'express'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../modules/mailer')
const jwt_decode = require('jwt-decode')

const authConfig = require('../config/auth.json')

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

interface data {
    id: string,
}

export default {

    async create(req:Request, res:Response){
        const {email, username} = req.body

        if(req.body.admin === true){
            return res.status(200).send({error: 'You is a bad Hacker! kkkkkkk'})
        }

        try {
            if(await User.findOne({ email })){
                return res.status(200).send({ error: 'Email ja está em uso.'})
            }

            if(await User.findOne({ username })){
                return res.status(200).send({ error: 'Nome ja está em uso.' })
            }

            const user = await User.create(req.body)

            user.password = undefined

            const data = {
                token: generateToken({ id: user.id }),
                profession: "",
                user: {
                    userId: user._id,
                    professionId: "",
                    username: user.username,
                    countryId: user.countryId,
                    teamId: "",
                    admin: user.admin,
                    passwordVersion: user.passwordVersion
                }
            } 
    
            return res.status(201).send({ data })

        } catch (err) {
            return res.status(400).send({ error: 'Falha! Tente novamente.' + err})
        }
    },

    async login(req:Request, res:Response){
        const { email, password } = req.body

        const user = await User.findOne({ email }).select('+password')
        if(!user){
            return res.status(200).send({ error: 'Email não encontrado.' })
        }

        if(!await bcrypt.compare(password, user.password)){
            return res.status(200).send({ error: 'Senha inválida' })
        }

        let professionId = ""
        let profession = ""
        let teamId = ""

        if(user.profession) {
            if(user.profession === "Coach") {


                const coach = await Coach.findOne({ userId: user._id })


                professionId = coach._id
                profession = "Coach"

                if(coach.teamId) {
                    teamId = coach.teamId
                }

            } else if(user.profession == "President") {

                const president = await President.findOne({ userId: user._id })

                professionId = president._id
                profession = "President"

                if(president.teamId) {
                    teamId = president.teamId
                }

            }
        }

        user.password = undefined

        const data = {
            token: generateToken({ id: user.id, profession: user.profession }),
            profession,
            user: {
                userId: user._id,
                professionId,
                username: user.username,
                countryId: user.countryId,
                teamId,
                admin: user.admin,
                passwordVersion: user.passwordVersion
            }
        } 

        return res.status(200).send({ data })
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

            user.passwordVersion = Math.floor(Math.random() * 1000)

            await user.save()
            
            return res.status(200).send({ message: 'Password has been updated' })

        } catch (err) {
            res.status(400).send({error: 'Cannot reset password, try again'+err})
        }
    },

    async validateUser(req:Request, res:Response) {
        const {authorization} = req.headers

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        const user = await User.findOne({ _id: id })

        try {

            let data = {
                profession: "",
                teamId: "",
                passwordVersion: user.passwordVersion
            }

            if(!user){
                return res.status(400).send({error: 'Usuário não encontrado'})
            }

            if(!user.profession){
                return res.status(200).send({data})
            }

            if(user.profession === "Coach"){

                const coach = await Coach.findOne({userId: id})

                if(!coach){
                    return res.status(200).send({data})
                }

                data.profession = "Coach"

                if(!coach.teamId){
                    return res.status(200).send({data})
                }

                data.teamId = coach.teamId

                return res.status(200).send({data})

            } else {

                const president = await President.findOne({userId: id})

                if(!president){
                    return res.status(200).send({data})
                }

                data.profession = "President"

                if(!president.teamId){
                    return res.status(200).send({data})
                }

                data.teamId = president.teamId

                return res.status(200).send({data})

            }
            
        } catch (err) {
            res.status(400).send({error: 'Cannot reset password, try again'})
        }
    },

    async getUserProfile(req:Request, res:Response) {
        const {authorization} = req.headers
        const {professionId} =req.params

        const tokenSplited = authorization.split(' ') 

        const token = tokenSplited[1]

        const data: data = jwt_decode(token)

        const {id} = data

        try {

        const user = await User.findOne({ _id: id })

        if(!user) {
            return res.status(400).send({error: 'User not found.'})
        }

        const professionUser = await User.findOne({professionId: professionId})

        if(!professionUser) {
            return res.status(400).send({error: 'Profession user not founded.'})
        }

        console.log(user.profession)

        if(user.profession === 'Coach'){

            const coach = await Coach.findOne({_id: professionId}).populate(['countryId', 'activeContract.teamId','career.teamId'])

            if(!coach) {
                return res.status(400).send({error: 'Coach not found.'})
            }

            const coachData = {
                userId: coach.userId,
                username: coach.username,
                description: coach.description,
                countryImage: coach.countryId.pictureUrl,
                activeContract: coach.activeContract ? coach.activeContract : {
                    teamId: {
                        _id: '',
                        name: '',
                        pictureUrl: '',
                    },
                    initialDate: '',
                    salary: 0,
                    monthsDuration: 0,
                },
                career: coach.career
            }

            return res.status(200).send({president: coachData})

        } else if (user.profession === 'President') {
            const president = await President.findOne({_id: professionId}).populate(['countryId', 'activeMandate.teamId','career.teamId'])

            if(!president) {
                return res.status(400).send({error: 'President not found.'})
            }

            const presidentData = {
                userId: president.userId,
                username: president.username,
                description: president.description,
                countryImage: president.countryId.pictureUrl,
                activeMandate: president.activeMandate ? president.activeMandate : {
                    teamId: {
                        _id: '',
                        name: '',
                        pictureUrl: '',
                    },
                    initialDate: '',
                },
                career: president.career
            }

            return res.status(200).send({president: presidentData})
        } else {
            return res.status(400).send({error: 'This user dont`t have profesison'})
        }

        } catch (err) {
            return res.status(400).send({ error: 'Operation failed' + err})
        }
    }

}