const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

//import config
const config = require('./utils/config')


app.use(cors())
app.use(express.json())

//import route controller middleware - must take this middleware into use after json parser
const blogsRouter = require('./controllers/blogs')
app.use('/api/blogs', blogsRouter)

mongoose.connect(config.mongoUrl)
const PORT = config.port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})