const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose=require("mongoose")


mongoose.connect(process.env.DATABASE)
.then(()=>{
    console.log("mongo connected")
})
.catch(()=>{
    console.log("error")
})

const Schema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type: Number,
        unique: true,
        required: true
    },
    email:{
     type:String,
     unique:true
    },
    token:{
        type:String,
        required:true
    }
})

const Collection=new mongoose.model("SignupCollection",Schema)

module.exports=Collection