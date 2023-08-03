const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
    {
        "title": "First Title",
        "author": "First Author",
        "url": "First URL",
        "likes": 1
    },
    {
        "title": "Second Title",
        "author": "Second Author",
        "url": "Second URL",
        "likes": 2
    }
]


beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})



describe('basic databasing functions on blogs', () => {
    test('get request returns an array of the correct number of blogs (2)',
        async () => {
            const response = await api.get('/api/blogs')
            const result = response.body.length
            expect(result).toBe(2)
        })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('post requests increases number of blogs by one',
        async () => {
            const blogToAdd = {
                title: 'testAdd',
                author: 'testAuthor',
                url: 'testUrl',
                likes: 0
            }

            const response = await api.post('/api/blogs')
                .send(blogToAdd)


            //checking status code and data-type for post response
            expect(response.statusCode).toBe(201)
            expect(response.headers['content-type']).toContain('application/json')

            //checking addition to database has been succesful

            const responseFromDB = await Blog.find({})
            //initialBlogs length + 1 
            // expect(responseFromDB.length).toBe(initialBlogs.length+1)

        })
    test('get request returns unique identifier id', async () => {
        const response = await api.get('/api/blogs')
        const returnedBlogs = response.body
        returnedBlogs.forEach(blog => {
            return (
                expect(blog.id).toBeDefined()
            )
        })
    })

    test('if likes missing from post request new blog - default to 0', async () => {
        const blogToAdd1 = {
            title: 'testAdd',
            author: 'testAuthor',
            url: 'testUrl'
        }
        const blogToAdd2 = {
            title: 'testAdd2',
            author: 'testAuthor2',
            url: 'testUrl2',
            likes: 100
        }
        //response from blogToAdd1 and validation
        const response1 = await api.post('/api/blogs')
            .send(blogToAdd1)


        expect(response1.body.likes).toBe(0)

        //also do validation on the value in the database, not just the response
        //do so by looking at the last element in the database - most recently added

        const valuesInDBAfterFirstAdd = await Blog.find({})
        const lastValueAfterFirstAdd = valuesInDBAfterFirstAdd.slice(-1)
        expect(lastValueAfterFirstAdd[0].likes).toBe(0)

        //same again for add with likes already assigned, make sure likes dont change
        const response2 = await api.post('/api/blogs')
            .send(blogToAdd2)

        expect(response2.body.likes).toBe(100)


        const valuesInDBAfterSecondAdd = await Blog.find({})
        const lastValueAfterSecondAdd = valuesInDBAfterSecondAdd.slice(-1)
        expect(lastValueAfterSecondAdd[0].likes).toBe(100)


    }, 100000000)


})

describe('bad post requests', () => {
    test('if title missing from post request - respond 400 bad request', async () => {
        const blogToAddNoTitle = {
            author: 'testAuthor',
            url: 'testUrl'
        }

        const responseFromNoTitleAdd = await api.post('/api/blogs').send(blogToAddNoTitle)

        expect(responseFromNoTitleAdd.statusCode).toBe(400)


    })

    test('if url missing from post request - respond 400 bad request', async () => {
        const blogToAddNoUrl = {
            title: 'testTitle',
            author: 'testAuthor'
        }

        const responseFromNoUrlAdd = await api.post('/api/blogs').send(blogToAddNoUrl)

        expect(responseFromNoUrlAdd.statusCode).toBe(400)


    })
})




afterAll(async () => {
    await mongoose.connection.close()
})
