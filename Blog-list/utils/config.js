require('dotenv').config()

const mongoUrl = process.env.MONGODB_URI
const port = process.env.port

module.exports = {
    mongoUrl,
    port
}