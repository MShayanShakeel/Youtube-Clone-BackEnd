const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express')

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGAN,
    credentials: true
}));
console.log(process.env.CORS_ORIGAN, "working");


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("Public"))
app.use(cookieParser())



// import Router start here
const userRouter = require('./Routers/user.routers.js')


// ROUTER CONFIGRATION  START HERE
app.use('/api/v1/users', userRouter)


module.exports = app;
// export { app }

