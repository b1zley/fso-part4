const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

//import jwt here as well as in app.js
const jwt = require('jsonwebtoken')

//helper function which gets token code from authorization header
//this function has been deprecated by the tokenExtractor middleware... 
//access authorization header via request.token
const getTokenFrom = (request) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    } else {
        return null
    }
}



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

    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
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
    console.log('request body = ', body)
    const user = await User.findById(body.user.id)
    console.log('user = ', user)



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
        !userIdList.includes(body.user.id)) {
        console.log('id not found')
        response.status(404).send('id not found')
    } else {
        console.log('format accepted, id found')
        // user.notes = user.notes.concat(savedNote._id)
        // await user.save()
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

    const user = request.user
    if (user === undefined) {
        return response.status(401).json({ error: 'invalid token' })
    }

    const body = request.body
    const blog = new Blog({

        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id

    })






    if (blog.url === undefined || blog.title === undefined) {
        response.status(400).send('bad post request - missing url or title')
    } else if (!user) {
        response.status(400).send('bad post - user not found')
    }
    else {
        const result = await blog.save()
        console.log('result populate', await result.populate('user', { username: 1, name: 1, id: 1 }))
        user.blogs = user.blogs.concat(result._id)
        await user.save()
        response.status(201).json(result)
    }
})
//delete one
blogsRouter.delete('/:id', async (request, response, next) => {
    // must change this function so that deletion
    // operations can only be carried out by the 
    // user who created the entry

    //first - must check the authorization token
    //supplied as header matches to a user
    const user = request.user
    if (user === undefined) {
        return response.status(401).json({ error: 'invalid token' })
    }

    //user is the user which corresponds to the auth - token

    //now must make sure user from request 
    // and user who created post for deletion
    // are equal, some screwing around required



    const requestId = request.params.id


    // use requestId to find blog to be removed

    const blogToRemove = await Blog.findById(requestId)
    if (blogToRemove === null) {
        console.log('deletion unsuccessful - object not found')
        return (response.status(404).end())
    }


    if (blogToRemove.user.toString() !== user.id.toString()) {
        return response.status(401).json({ error: 'token invalid - you sneaky pete!' })
    }

    // console.log('user who created blog: ',userWhoCreatedBlog)
    // console.log('user requesting deletion:', user)

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
    const attemptToFindById = await Blog.findById(request.params.id)

    

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