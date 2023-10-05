const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/specsy")
// -----------------------------
const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser');
const session = require("express-session")
const nocache = require('nocache')
const config = require('./config/config')

app.use(express.static(path.join(__dirname, "public")));
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')

app.use(cookieParser());
app.use(session({secret:config.sessionKey,cookie:{maxAge:86400000}}))
app.use(nocache());
// app.set('trust proxy', 'loopback');



app.use('/',userRouter)
app.use('/admin',adminRouter)

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
  })

app.listen(3000,()=>{
    console.log("Server Running...");
})