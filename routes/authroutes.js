const authrouter = require("express").Router()
const { register, loginUser, createUserByAdmin, getCompanyUser, editSettings, deleteCompanyUser, editCompanyUser, updatePassword, getSettings, getAllCompany } = require("../controllars/authcontrollar")
const { ValidateUser } = require("../middlewares/authMiddleware")


// new  user register routes
authrouter.post("/register" ,register)
authrouter.post("/create-user" , ValidateUser,createUserByAdmin)
authrouter.get("/get-company-user" , ValidateUser,getCompanyUser)
authrouter.delete("/delete-company-user/:id" , ValidateUser,deleteCompanyUser)
authrouter.put("/edit-company-user/:id" , ValidateUser,editCompanyUser)
authrouter.put("/update-password" , ValidateUser,updatePassword)
authrouter.put("/settings" , ValidateUser,editSettings)
authrouter.get("/settings" , ValidateUser,getSettings)
authrouter.get("/all-company" , ValidateUser,getAllCompany)
authrouter.post("/login" ,loginUser)



module.exports = {authrouter};
