const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/specsy")
// -----------------------------
const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(path.join(__dirname, "public")));
const userRouter = require('./routes/userRouter')

app.use('/',userRouter)


app.listen(3000,()=>{
    console.log("Server Running...");
})