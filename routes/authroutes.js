const authrouter = require("express").Router()
const { register, loginUser, createUserByAdmin, getCompanyUser, editSettings, deleteCompanyUser, editCompanyUser, updatePassword, getSettings, getAllCompany, updateCompanyStatus, assignLead } = require("../controllars/authcontrollar")
const { ValidateUser } = require("../middlewares/authMiddleware")


// new  user register routes
authrouter.post("/register" ,register)
authrouter.post("/create-user" , ValidateUser,createUserByAdmin)
authrouter.get("/get-company-user" , ValidateUser,getCompanyUser)
authrouter.delete("/delete-company-user/:id" , ValidateUser,deleteCompanyUser)
authrouter.put("/update-company-status/:id" , ValidateUser,updateCompanyStatus)
authrouter.put("/edit-company-user/:id" , ValidateUser,editCompanyUser)
authrouter.put("/update-password" , ValidateUser,updatePassword)
authrouter.put("/settings" , ValidateUser,editSettings)
authrouter.get("/settings" , ValidateUser,getSettings)
authrouter.post("/assign-lead" , ValidateUser,assignLead)
authrouter.get("/all-company" , ValidateUser,getAllCompany)
authrouter.post("/login" ,loginUser)



module.exports = {authrouter};
