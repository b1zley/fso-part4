const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
    // Blog.find({})
    //     .then(blogs => {
    //         response.json(blogs)
    //     })

    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
    if (request.body.likes === undefined) {
        request.body.likes = 0
    }
    const blog = new Blog(request.body)

    if (blog.url === undefined || blog.title === undefined) {
        response.status(400).send('bad post request - missing url or title')
    } else {
        const result = await blog.save()
        response.status(201).json(result)
    }


    // blog
    //     .save()
    //     .then(result => {
    //         response.status(201).json(result)
    //     })
})



module.exports = blogsRouter