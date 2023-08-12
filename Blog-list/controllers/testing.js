const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

testingRouter.post('/reset', async (request, response, next) => {

    await Blog.deleteMany({})
    await User.deleteMany({})

    response.status(204).send('delete all successful')


})

module.exports = testingRouter
