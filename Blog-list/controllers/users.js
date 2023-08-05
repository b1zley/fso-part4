

const bcrypt = require('bcrypt')

const usersRouter = require('express').Router()

const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
    const userList = await User.find({})

    response.send(userList)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if (username.length < 3 || password.length < 3) {
        response.status(400).send('error - username and password length must be greater than 3 characters long')
    } else {
        
        const saltRounds = 10

        const passwordHash = await bcrypt.hash(password, saltRounds)

        const user = new User({
            username,
            name,
            passwordHash
        })

        const savedUser = await user.save()

        response.status(201).json(savedUser)


    }





})

module.exports = usersRouter