const Blog = require('../models/blog')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const initialUsers = [{
  username: "usernameWithTwoBlogs",
  name: "userWithTwoBlogs",
  blogs: [
    {
      title: "testPost1139",
      author: "test",
      url: "test",
      likes: 0,
      user: "64cf781ed0f1606991121376",
      id: "64cf8a9d6e62d97086eb6f24"
    }
  ],
  id: "64cf781ed0f1606991121376"
}
]

const initialBlogs = [
  {
    title: "testPost1139",
    author: "test",
    url: "test",
    likes: 0,
    user: {
      username: "test",
      name: "test2Name",
      id: "64cf781ed0f1606991121376"
    },
    id: "64cf8a9d6e62d97086eb6f24"
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const generateUserWithTwoBlogsToken = async () => {
  const userWithTwoBlogsLogin =
  {
    username: 'userWithTwoBlogs',
    password: 'test'
  }
  const login =
    await api.post('/api/login')
      .send(userWithTwoBlogsLogin)

  let token = login._body.token
  token = `Bearer ${token}`
  return(token)
}

module.exports = {
  initialBlogs,
  generateUserWithTwoBlogsToken, 
  initialUsers, nonExistingId, blogsInDb, usersInDb
}