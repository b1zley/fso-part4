const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
//delete all
blogsRouter.delete('/', async (request, response) => {
    const removeManyResponse = await Blog.deleteMany({})
    response.send(removeManyResponse)
})
//get requests
blogsRouter.get('/', async (request, response) => {
    // Blog.find({})
    //     .then(blogs => {
    //         response.json(blogs)
    //     })

    const blogs = await Blog.find({}).populate('user',{username: 1, name: 1, id: 1})
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blogFindResponse = await Blog.findById(request.params.id)
    if (blogFindResponse) {
        response.json(blogFindResponse)
    } else {
        response.status(404).send('id not found')
    }
})
//put requests
blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const user = await User.findById(body.userId)
    


    const blogToPut = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id

    }



    const blogList = await Blog.find({})

    const idList = blogList.map(blog => blog.id)

    const userList = await User.find({})
    const userIdList = userList.map(user => user.id)





    const regexIdFormat =
        /[0-9a-fA-F]{24}/

    if (!regexIdFormat.test(request.params.id)) {
        console.log('format not accepted')
        response.status(400).send('id format not accepted')
    } else if (!idList.includes(request.params.id) || 
                    !userIdList.includes(body.userId)) {
        console.log('id not found')
        response.status(404).send('id not found')
    } else {
        console.log('format accepted, id found')
        user.notes = user.notes.concat(savedNote._id)
        await user.save()
        const responseFromPut = await Blog.findByIdAndUpdate(request.params.id, blogToPut, { new: true })
        // response.json(responseFromPut)
        response.send(responseFromPut)
    }






})



//post requests
blogsRouter.post('/', async (request, response, next) => {
    if (request.body.likes === undefined) {
        request.body.likes = 0
    }
    const user = await User.findById(request.body.userId)
    const body = request.body
    const blog = new Blog({
        
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id

    })


    



    if (blog.url === undefined || blog.title === undefined) {
        response.status(400).send('bad post request - missing url or title')
    } else if (!user){
        response.status(400).send('bad post - user not found')
    }
    else {
        const result = await blog.save()
        user.blogs = user.blogs.concat(result._id)
        console.log(result._id)
        await user.save()
        response.status(201).json(result)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {

    const requestId = request.params.id

    //checking format of request Id
    //example requestId 
    // 64cc130ab1929ae04075b36e
    const regexIdFormat =
        /[0-9a-fA-F]{24}/

    if (regexIdFormat.test(requestId)) {
        console.log('format accepted')
    } else {
        console.log('format not accepted')
        response.status(400).end()
    }

    const responseFromDeletion = await Blog.findByIdAndRemove(request.params.id)


    if (responseFromDeletion) {
        console.log('deletion successful')
        response.status(204).end()
    } else {
        console.log('deletion unsuccessful - object not found')
        response.status(404).end()
    }




})



module.exports = blogsRouter