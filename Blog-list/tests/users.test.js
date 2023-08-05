const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')


const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)
//...

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash: passwordHash })

    await user.save()
  }, 1000000)

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()
    

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with username or pass < 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUserShortUsername = {
      username: 'sh',
      name: 'short username',
      password: 'correct password length'
    }

    const newUserShortPassword = {
      username: 'correct username length',
      name: 'short password',
      password: 'sh'
    }

    const responseFromShortUsername = await api.post('/api/users')
                              .send(newUserShortUsername)

    expect(responseFromShortUsername.status).toBe(400)

    const usersAfterShortUsernameAdd = await helper.usersInDb()

    expect(usersAfterShortUsernameAdd.length).toBe(usersAtStart.length)

    const responseFromShortPassword = 
      await api.post('/api/users')
        .send(newUserShortPassword)

    expect(responseFromShortPassword.status).toBe(400)

    const usersAfterShortPasswordAdd = await helper.usersInDb()

    expect(usersAfterShortPasswordAdd.length).toBe(usersAtStart.length)

  })

})