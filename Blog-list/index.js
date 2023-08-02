const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

//import config
const config = require('./utils/config')

//import middleware util
const middleware = require('./utils/middleware')


app.use(cors())
app.use(express.json())

//import logger
const logger = require('./utils/logger')

//use req logger middleware
app.use(middleware.requestLogger)

//import route controller middleware - must take this middleware into use after json parser
const blogsRouter = require('./controllers/blogs')
app.use('/api/blogs', blogsRouter)



//use unkendpoint middleware
app.use(middleware.unknownEndpoint)

//use errorhandler middleware
app.use(middleware.errorHandler)

mongoose.connect(config.mongoUrl)
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})