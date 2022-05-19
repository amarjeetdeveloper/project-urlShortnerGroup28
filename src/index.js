const express = require("express");
let bodyParser = require("body-parser");
const route = require("../src/route/route.js");
const mongoose = require("mongoose");;
const app = express();

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://amarjeet:Eh9T4queOuB4y7rj@cluster0.u3rh4.mongodb.net/group28Database",{
    useNewUrlParser:true
})
.then( ()=> console.log("mongoDb is Connected"))
.catch(err => console.log(err))

app.use("/", route);

const PORT = process.env.PORT || 3000
app.listen(PORT,console.log(`Express app running on ${PORT}`))