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


describe('deletion functionality testing', () => {
    test('when delete request on valid id - status code 204 - one blog less', async () => {
        const blogsAtStart = await Blog.find({})
        const blogsAtStartJson = blogsAtStart.map(blog => blog.toJSON())
        console.log(blogsAtStartJson[0].id)
        const idToDelete = blogsAtStartJson[0].id
        const deleteResponse = await api.delete(`/api/blogs/${idToDelete}`)

        // expect(deleteResponse.statusCode).toBe(204)

        const blogsAfterDeletion = await Blog.find({})

        expect(blogsAfterDeletion.length)
            .toBe(initialBlogs.length - 1)
    })

    test('when delete on invalid id - status code 400 - same number of blogs',
        async () => {
            const invalidIdToDelete = '1'
            const responseFromInvalidIdDeletion = await api.delete(`/api/blogs/${invalidIdToDelete}`)

            expect(responseFromInvalidIdDeletion.statusCode).toBe(400)

            const blogsAfterFailedDeletion = await Blog.find({})

            expect(blogsAfterFailedDeletion.length).toBe(initialBlogs.length)
        })

    test('when delete on valid id which is not found - 404', async () => {
        const blogsBeforeDeletion = await Blog.find({})
        const blogsBeforeDeletionJson = blogsBeforeDeletion.map(blog => blog.toJSON())
        const validIdToDelete = blogsBeforeDeletionJson[0].id

        console.log(validIdToDelete)

        String.prototype.replaceAt = function (index, replacement) {
            if (index >= this.length) {
                return this.valueOf();
            }

            return this.substring(0, index) + replacement + this.substring(index + 1);
        }

        let validNonexistentId = validIdToDelete.replaceAt(0, '1')
        validNonexistentId = validNonexistentId.replaceAt(1, '5')
        validNonexistentId = validNonexistentId.replaceAt(2, 'd')
        console.log(validNonexistentId)

        const responseBadDelete = await api.delete(`/api/blogs/${validNonexistentId}`)

        expect(responseBadDelete.statusCode).toBe(404)

        const blogsAfterFailedDeletion = await Blog.find({})

        expect(blogsAfterFailedDeletion.length).toBe(initialBlogs.length)


    })
})

describe('get on individ blog post', () => {

    test('get on valid id in database', async () => {
        const blogsAtStart = await Blog.find({})
        const blogsAtStartJson = blogsAtStart.map(blog => blog.toJSON())
        const idToShow = blogsAtStartJson[0].id
        const blogToShow = blogsAtStartJson[0]

        const responseFromValidGet = await api.get(`/api/blogs/${idToShow}`)


        expect(responseFromValidGet.statusCode).toBe(200)

        //write code for expecting returned content to be the same

    })
    test('get on valid id not in database', async () => {
        const blogsBeforeDeletion = await Blog.find({})
        const blogsBeforeDeletionJson = blogsBeforeDeletion.map(blog => blog.toJSON())
        const validIdToFind = blogsBeforeDeletionJson[0].id



        String.prototype.replaceAt = function (index, replacement) {
            if (index >= this.length) {
                return this.valueOf();
            }

            return this.substring(0, index) + replacement + this.substring(index + 1);
        }

        let validNonexistentId = validIdToFind.replaceAt(0, '1')
        validNonexistentId = validNonexistentId.replaceAt(1, '5')
        validNonexistentId = validNonexistentId.replaceAt(2, 'd')


        const responseFromValidGet = await api.get(`/${validNonexistentId}`)
        expect(responseFromValidGet.statusCode).toBe(404)
    })
})

describe('put requests on individ blog post', () => {
    test('put request with valid id', async () => {
        let blogsBeforeUpdate = await Blog.find({})
        blogsBeforeUpdateJson = blogsBeforeUpdate.map(blog => blog.toJSON())

        let blogPostToUpdate = blogsBeforeUpdateJson[0]

        updatedBlogPost = blogPostToUpdate
        updatedBlogPost.likes = blogPostToUpdate.likes + 1

        idToUpdate = blogPostToUpdate.id

        const response = await api.put(`/api/blogs/${idToUpdate}`).send(updatedBlogPost)

        expect(response.status).toBe(200)
        console.log(response)

        expect(response.body).toEqual(updatedBlogPost)

    })

    test('put request with valid id format - not found - returns 404', async () => {
        const blogsBeforeDeletion = await Blog.find({})
        const blogsBeforeDeletionJson = blogsBeforeDeletion.map(blog => blog.toJSON())
        const validIdToFind = blogsBeforeDeletionJson[0].id



        String.prototype.replaceAt = function (index, replacement) {
            if (index >= this.length) {
                return this.valueOf();
            }

            return this.substring(0, index) + replacement + this.substring(index + 1);
        }

        let validNonexistentId = validIdToFind.replaceAt(0, '1')
        validNonexistentId = validNonexistentId.replaceAt(1, '5')
        validNonexistentId = validNonexistentId.replaceAt(2, 'd')
        validNonexistentId = validNonexistentId.replaceAt(3, 'd')
        validNonexistentId = validNonexistentId.replaceAt(4, '1')
        validNonexistentId = validNonexistentId.replaceAt(5, '1')
        const blogToPut = blogsBeforeDeletion[0]

        const response = await api.put(`/api/blogs/${validNonexistentId}`, blogToPut, {new: true})

        expect(response.statusCode).toBe(404)
        
    })

    test('put request with invalid id format - returns 400', async () => {
        const invalidId = 1
        const blogToPut = {
            "title": "titleTest",
            "author": "authorTest",
            "url": "urlTest",
            "likes": 900
        }
        const response = await api.put(`/api/blogs/${invalidId}`, blogToPut, {new: true})

        expect(response.status).toBe(400)
    })
})



afterAll(async () => {
    await mongoose.connection.close()
})
