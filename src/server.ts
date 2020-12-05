const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

import routes from './routes'

const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost/WSO", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
    console.log("Conectado com sucesso")
}).catch((err) => {
    console.log("Erro " + err)
})

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(routes)
app.listen(3333)