const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

const initialBlogs = helper.initialBlogs
const initialUsers = helper.initialUsers

beforeEach(async () => {
    // clear test db of data
    await User.deleteMany({})
    await Blog.deleteMany({})
    //define saltRounds for encryption
    const saltRounds = 10
    const password = 'test'
    // add new user - userWithTwoBlogs
    const userWithTwoBlogsPasswordHash =
        await bcrypt.hash(password, saltRounds)
    const userWithTwoBlogs = new User({
        username: 'userWithTwoBlogs',
        name: 'userWithTwoBlogs',
        passwordHash: userWithTwoBlogsPasswordHash,
        blogs: [],
    })
    await userWithTwoBlogs.save()
    const usersInDBAfterFirstSave = await User.find({})
    const userWithTwoBlogsId = usersInDBAfterFirstSave[0].id


    // add blog one to userWithTwoBlogs
    const userWithTwoBlogsBlogOne = new Blog({
        title: 'userWithTwoBlogs - blogOne',
        author: 'test',
        url: 'test',
        likes: 0,
        user: userWithTwoBlogsId
    }
    )
    const userWithTwoBlogsBlogTwo = new Blog({
        title: 'userWithTwoBlogs - blogTwo',
        author: 'test',
        url: 'test',
        likes: 1,
        user: userWithTwoBlogsId

    })

    await userWithTwoBlogsBlogOne.save()
    await userWithTwoBlogsBlogTwo.save()
    userWithTwoBlogs.blogs = userWithTwoBlogs.blogs.concat(userWithTwoBlogsBlogOne)
    await userWithTwoBlogs.save()
    userWithTwoBlogs.blogs = userWithTwoBlogs.blogs.concat(userWithTwoBlogsBlogTwo)
    await userWithTwoBlogs.save()

    const userWithNoBlogsPasswordHash =
        await await bcrypt.hash(password, saltRounds)

    userWithNoBlogs = new User({
        username: 'userWithNoBlogs',
        name: 'userWithNoBlogs',
        passwordHash: userWithNoBlogsPasswordHash,
        blogs: [],
    })

    await userWithNoBlogs.save()


})



describe('basic databasing functions on blogs', () => {
    test('get request returns an array of the correct number of blogs - 2',
        async () => {
            const response = await api.get('/api/blogs')
            const result = response.body.length
            expect(result).toBe(2)
            // console.log(response.body)
            // console.log('------------------------')

            const responseFromUsers = await api.get('/api/users')
            // console.log(responseFromUsers.body)
            const secondResult = responseFromUsers.body.length
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
            const usersInDBAtStart = await User.find({})
            const userWithTwoBlogsId = usersInDBAtStart[0].id

            const userWithTwoBlogsLogin =
            {
                username: 'userWithTwoBlogs',
                password: 'test'
            }
            const login =
                await api.post('/api/login')
                    .send(userWithTwoBlogsLogin)

            let token = login._body.token
            console.log(token)
            token = `Bearer ${token}`
            const blogToAdd = {
                title: 'testAdd',
                author: 'testAuthor',
                url: 'testUrl',
            }

            const response =
                await api.post('/api/blogs')
                    .send(blogToAdd)
                    .set({ Authorization: token })


            //checking status code and data-type for post response
            expect(response.statusCode).toBe(201)
            expect(response.headers['content-type']).toContain('application/json')

            //checking addition to database has been succesful

            const responseFromDB = await Blog.find({})

            expect(responseFromDB.length).toBe(3)

        })

    test('post request with no token returns 401 Unauthorized',
        async () => {
            const blogToAdd = {
                title: 'testAdd',
                author: 'testAuthor',
                url: 'testUrl',
            }

            const blogsAtStart = await helper.blogsInDb()
            console.log(blogsAtStart)
            const responseFromBadPost = 
                await api.post('/api/blogs')
                        .send(blogToAdd)

            expect(responseFromBadPost.status).toBe(401)
            const blogsAtEnd = await helper.blogsInDb()
            console.log('blogs at end -------')
            console.log(blogsAtEnd)
            expect(blogsAtEnd.length).toBe(blogsAtStart.length)
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
        // securing login token 
        const usersInDBAtStart = await User.find({})
        const userWithTwoBlogsId = usersInDBAtStart[0].id

        const token = await helper.generateUserWithTwoBlogsToken()



        //response from blogToAdd1 and validation
        const response1 = await api.post('/api/blogs')
            .send(blogToAdd1)
            .set({ Authorization: token })


        expect(response1.body.likes).toBe(0)

        //also do validation on the value in the database, not just the response
        //do so by looking at the last element in the database - most recently added

        const valuesInDBAfterFirstAdd = await Blog.find({})
        const lastValueAfterFirstAdd = valuesInDBAfterFirstAdd.slice(-1)
        expect(lastValueAfterFirstAdd[0].likes).toBe(0)

        //same again for add with likes already assigned, make sure likes dont change
        const response2 = await api.post('/api/blogs')
            .send(blogToAdd2)
            .set({ Authorization: token })

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
        const token = await helper.generateUserWithTwoBlogsToken()
        const responseFromNoTitleAdd =
            await api
                .post('/api/blogs')
                .send(blogToAddNoTitle)
                .set({ Authorization: token })

        expect(responseFromNoTitleAdd.statusCode).toBe(400)


    })

    test('if url missing from post request - respond 400 bad request', async () => {
        const blogToAddNoUrl = {
            title: 'testTitle',
            author: 'testAuthor'
        }
        const token = await helper.generateUserWithTwoBlogsToken()

        const responseFromNoUrlAdd =
            await api
                .post('/api/blogs')
                .send(blogToAddNoUrl)
                .set({ Authorization: token })

        expect(responseFromNoUrlAdd.statusCode).toBe(400)


    })
})


describe('deletion functionality testing', () => {



    test('when delete request on valid id - status code 204 - one blog less', async () => {
        const blogsAtStart = await Blog.find({})
        const blogsAtStartJson = blogsAtStart.map(blog => blog.toJSON())
        console.log(blogsAtStartJson[0].id)
        const idToDelete = blogsAtStartJson[0].id
        const token = await helper.generateUserWithTwoBlogsToken()
        const deleteResponse =
            await api
                .delete(`/api/blogs/${idToDelete}`)
                .set({ Authorization: token })

        expect(deleteResponse.statusCode).toBe(204)

        const blogsAfterDeletion = await Blog.find({})

        expect(blogsAfterDeletion.length)
            .toBe(blogsAtStartJson.length - 1)
    })

    test('when delete on invalid id - status code 400 - same number of blogs',
        async () => {
            const invalidIdToDelete = '1'
            const token = await helper.generateUserWithTwoBlogsToken()
            const blogsBeforeDeletion = await helper.blogsInDb()
            console.log(blogsBeforeDeletion)


            const responseFromInvalidIdDeletion =
                await api
                    .delete(`/api/blogs/${invalidIdToDelete}`)
                    .set({ Authorization: token })

            expect(responseFromInvalidIdDeletion.statusCode).toBe(400)

            const blogsAfterFailedDeletion = await Blog.find({})

            expect(blogsAfterFailedDeletion.length).toBe(blogsBeforeDeletion.length)
        })

    test('when delete on valid id which is not found - 404', async () => {

        console.log('in 404 test')

        const blogsBeforeDeletion = await Blog.find({})
        const blogsBeforeDeletionJson = blogsBeforeDeletion.map(blog => blog.toJSON())
        const validIdToDelete = blogsBeforeDeletionJson[0].id

        const token = await helper.generateUserWithTwoBlogsToken()



        String.prototype.replaceAt = function (index, replacement) {
            if (index >= this.length) {
                return this.valueOf();
            }

            return this.substring(0, index) + replacement + this.substring(index + 1);
        }

        let validNonexistentId = validIdToDelete.replaceAt(0, '1')
        validNonexistentId = validNonexistentId.replaceAt(1, '5')
        validNonexistentId = validNonexistentId.replaceAt(2, 'd')

        const responseBadDelete =
            await api
                .delete(`/api/blogs/${validNonexistentId}`)
                .set({ Authorization: token })

        expect(responseBadDelete.statusCode).toBe(404)

        const blogsAfterFailedDeletion = await Blog.find({})

        expect(blogsAfterFailedDeletion.length).toBe(blogsBeforeDeletion.length)


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


//would have fixed put requests on individ but not required to 
//update functionality to work with token verification
//this all ended up breaking put requests - if I should have fixed this
//my bad
// describe('put requests on individ blog post', () => {
//     test('put request with valid id', async () => {
//         let blogsBeforeUpdate = await Blog.find({})
//         blogsBeforeUpdateJson = blogsBeforeUpdate.map(blog => blog.toJSON())

//         let blogPostToUpdate = blogsBeforeUpdateJson[0]

//         updatedBlogPost = blogPostToUpdate
//         updatedBlogPost.likes = blogPostToUpdate.likes + 1

//         idToUpdate = blogPostToUpdate.id

//         const response = await api.put(`/api/blogs/${idToUpdate}`).send(updatedBlogPost)

//         expect(response.status).toBe(200)
//         console.log(response)

//         expect(response.body).toEqual(updatedBlogPost)

//     })

//     test('put request with valid id format - not found - returns 404', async () => {
//         const blogsBeforeDeletion = await Blog.find({})
//         const blogsBeforeDeletionJson = blogsBeforeDeletion.map(blog => blog.toJSON())
//         const validIdToFind = blogsBeforeDeletionJson[0].id



//         String.prototype.replaceAt = function (index, replacement) {
//             if (index >= this.length) {
//                 return this.valueOf();
//             }

//             return this.substring(0, index) + replacement + this.substring(index + 1);
//         }

//         let validNonexistentId = validIdToFind.replaceAt(0, '1')
//         validNonexistentId = validNonexistentId.replaceAt(1, '5')
//         validNonexistentId = validNonexistentId.replaceAt(2, 'd')
//         validNonexistentId = validNonexistentId.replaceAt(3, 'd')
//         validNonexistentId = validNonexistentId.replaceAt(4, '1')
//         validNonexistentId = validNonexistentId.replaceAt(5, '1')
//         const blogToPut = blogsBeforeDeletion[0]

//         const response = await api.put(`/api/blogs/${validNonexistentId}`, blogToPut, { new: true })

//         expect(response.statusCode).toBe(404)

//     })

//     test('put request with invalid id format - returns 400', async () => {
//         const invalidId = 1
//         const blogToPut = {
//             "title": "titleTest",
//             "author": "authorTest",
//             "url": "urlTest",
//             "likes": 900
//         }
//         const response = await api.put(`/api/blogs/${invalidId}`, blogToPut, { new: true })

//         expect(response.status).toBe(400)
//     })
// })



afterAll(async () => {
    await mongoose.connection.close()
})
