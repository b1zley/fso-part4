const express = require('express')
const app = express()
//import async error handler
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
//import config
const config = require('./utils/config')
//import middleware util
const middleware = require('./utils/middleware')
//import logger
const logger = require('./utils/logger')
//import route controller middleware - must take this middleware into use after json parser
const blogsRouter = require('./controllers/blogs')
//import route controller middleware for users
const usersRouter = require('./controllers/users')
//import router controller middleware for login
const loginRouter = require('./controllers/login')


//use cors
app.use(cors())
//use static build from frontend
app.use(express.static('build'))
//use json parser
app.use(express.json())
//use req logger middleware
app.use(middleware.requestLogger)
//use blogsRouter
app.use('/api/blogs', blogsRouter)
// use blogRouter
app.use('/api/users', usersRouter)
// use loginRouter
app.use('/api/login', loginRouter)
//use unkendpoint middleware
app.use(middleware.unknownEndpoint)
//use errorhandler middleware
app.use(middleware.errorHandler)

mongoose.connect(config.mongoUrl)

module.exports = app

