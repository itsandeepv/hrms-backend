const authrouter = require("express").Router()
const { register, loginUser } = require("../controllars/authcontrollar")


// new  user register routes
authrouter.post("/register" ,register)
authrouter.post("/login" ,loginUser)



module.exports = {authrouter};
