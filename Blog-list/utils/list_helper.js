const listWithManyBlogs = [
    {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
    },
    {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
    },
    {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
    },
    {
        _id: "5a422b891b54a676234d17fa",
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        __v: 0
    },
    {
        _id: "5a422ba71b54a676234d17fb",
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
        __v: 0
    },
    {
        _id: "5a422bc61b54a676234d17fc",
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        __v: 0
    }
]



const dummy = (blogs) => {
    return (
        1
    )
}

const totalLikes = (blogs) => {
    const arrayOfLikes = blogs.map((blog) => {
        return blog.likes
    })



    const initialValue = 0
    const sumWithInitial = arrayOfLikes.reduce((accumulator, currentValue) =>
        accumulator + currentValue, initialValue

    )



    return sumWithInitial
}


const favoriteBlog = (blogs) => {
    let maxValue = 0
    let maxValueIndex = 0

    for (let i = 0; i < blogs.length; i++) {
        if (blogs[i].likes > maxValue) {
            maxValue = blogs[i].likes
            maxValueIndex = i
        }
    }


    return (
        blogs[maxValueIndex]
    )



}

const removeRepeatAuthorsFromBlogList = (blogs) => {
    let listOfAuthors = blogs.map(blog => {
        return blog.author
    })


    let indicesToRemoveFromListOfAuthors = []

    for (let i = 0; i < listOfAuthors.length; i++) {
        let authorToCheck = listOfAuthors[i]
        for (let indexCheckAgainst = 0; indexCheckAgainst < listOfAuthors.length; indexCheckAgainst++) {
            if (authorToCheck != 'to remove' &&
                i != indexCheckAgainst &&
                authorToCheck === listOfAuthors[indexCheckAgainst]) {
                listOfAuthors[indexCheckAgainst] = 'to remove'
                indicesToRemoveFromListOfAuthors.push(indexCheckAgainst)
            }
        }
    }




    for (let i = indicesToRemoveFromListOfAuthors.length - 1; i >= 0; i--) {
        listOfAuthors.splice(indicesToRemoveFromListOfAuthors[i], 1)
    }


    return (listOfAuthors)
}



const mostLikes = (blogs) => {

    let listOfAuthors = removeRepeatAuthorsFromBlogList(blogs)


    let listOfAuthorsTotalLikes = listOfAuthors.map(authorName => {
        return {
            author: authorName,
            totalLikes: 0
        }
    })


    for (let blogIndex = 0; blogIndex < blogs.length; blogIndex++) {


        for (let authorIndex = 0; authorIndex < listOfAuthorsTotalLikes.length; authorIndex++) {


            if (blogs[blogIndex].author === listOfAuthorsTotalLikes[authorIndex].author) {


                listOfAuthorsTotalLikes[authorIndex].totalLikes += blogs[blogIndex].likes
            }
        }
    }


    let listOfTotalLikes = listOfAuthorsTotalLikes.map(author => {
        return author.totalLikes
    })


    let indexToReturn = listOfTotalLikes.indexOf(Math.max(...listOfTotalLikes))


    let authorWithMaxLikes = listOfAuthorsTotalLikes[indexToReturn]
    return authorWithMaxLikes

}

const mostBlogs = (blogs) => {

    let listOfAuthors = removeRepeatAuthorsFromBlogList(blogs)


    listOfAuthors = listOfAuthors.map(authorName => {
        return {
            author: authorName,
            totalBlogs: 0
        }
    })

    for (let blogIndex = 0; blogIndex < blogs.length; blogIndex++) {

        for (let authorIndex = 0; authorIndex < listOfAuthors.length; authorIndex++) {

            if (blogs[blogIndex].author === listOfAuthors[authorIndex].author) {

                listOfAuthors[authorIndex].totalBlogs++
            }
        }
    }

    

    let maxBlogs = (Math.max(...listOfAuthors.map(author => {
        return author.totalBlogs
    })))

    let authorWithMostBlogs = listOfAuthors[
        listOfAuthors
            .map(author => {
                return author.totalBlogs
            })
            .indexOf(maxBlogs)
    ]

    


    return(authorWithMostBlogs)



}
mostBlogs(listWithManyBlogs)





module.exports = {
    dummy, totalLikes, favoriteBlog, mostLikes, mostBlogs
}