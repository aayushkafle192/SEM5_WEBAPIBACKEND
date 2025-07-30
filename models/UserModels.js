const mongoose=require("mongoose")
const User= new mongoose.Schema(
    { 
        firstName:{
            type:String,
            required:true,
        },
        lastName:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
        },
        role:{
            type: String,
            default: "normal"
        }
    },
    {
        timestamps:true
    }
)
module.exports=mongoose.model(
    "User",User
)