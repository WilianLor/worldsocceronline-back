import {Router} from 'express'
import UserController from'./controllers/userController'
import  PresidentController from'./controllers/presidentController'
import  CoachController from './controllers/coachController'
const authMiddleware = require('./middlewares/auth')

const routes = Router()

routes.post('/register', UserController.create)
routes.post('/login', UserController.login)
routes.get('/home', authMiddleware)

routes.post('/forgot-password', UserController.forgotPassword)
routes.post('/reset-password', UserController.resetPassword)


routes.post('/create/coach', authMiddleware ,CoachController.create)
routes.get('/show/userCoach', authMiddleware ,CoachController.getCoach)

routes.post('/create/president', authMiddleware ,PresidentController.create)
routes.get('/show/userPresident', authMiddleware ,PresidentController.getPresident)

export default routes;