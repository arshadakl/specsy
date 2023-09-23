const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/specsy")
// -----------------------------
const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser');
const session = require("express-session")
const nocache = require('nocache')

app.use(express.static(path.join(__dirname, "public")));
const userRouter = require('./routes/userRouter')
app.use(cookieParser());
app.use(session({secret:"key",cookie:{maxAge:86400000}}))
app.use(nocache());



app.use('/',userRouter)


app.listen(3000,()=>{
    console.log("Server Running...");
})